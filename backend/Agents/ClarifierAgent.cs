using Faultline.Services;

namespace Faultline.Agents;

public class ClarifierResult
{
    public bool NeedsClarification { get; set; }
    public List<string> Questions { get; set; } = new();
    public string ConfirmedContext { get; set; } = string.Empty;
}

public class ClarifierAgent
{
    private readonly AIServiceFactory _ai;

    public ClarifierAgent(AIServiceFactory ai)
    {
        _ai = ai;
    }

    public async Task<ClarifierResult> RunAsync(
        string rawError,
        ClassifierResult classification,
        CancellationToken ct = default)
    {
        var prompt = $"""
            You are a debugging assistant reviewing an error before deep analysis.
            
            ERROR TYPE: {classification.ErrorType} (confidence: {classification.Confidence})
            SUMMARY: {classification.Summary}
            
            RAW ERROR:
            {rawError}
            
            Your job: detect ambiguities that would block root cause analysis.
            Check for:
            - Placeholder values not replaced (like PASTE_YOUR_KEY_HERE, YOUR_API_KEY, etc.)
            - Mismatched language/framework (error says Python but context looks like C#)
            - Missing environment context (local vs staging vs production)
            - Truncated stack traces missing key frames
            
            If the error is clear enough to analyze, respond EXACTLY:
            NEEDS_CLARIFICATION: false
            CONFIRMED_CONTEXT: <one sentence confirming what you understand>
            
            If clarification is needed, respond EXACTLY:
            NEEDS_CLARIFICATION: true
            QUESTION_1: <first question>
            QUESTION_2: <second question if needed>
            QUESTION_3: <third question if needed>
            
            Only ask questions if truly necessary. Do not add any extra text.
            """;

        var raw = await _ai.CompleteAsync(prompt, ct);
        return Parse(raw);
    }

    private static ClarifierResult Parse(string raw)
    {
        var result = new ClarifierResult();

        foreach (var line in raw.Split('\n'))
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("NEEDS_CLARIFICATION:"))
                result.NeedsClarification = trimmed.Contains("true", StringComparison.OrdinalIgnoreCase);
            else if (trimmed.StartsWith("CONFIRMED_CONTEXT:"))
                result.ConfirmedContext = trimmed.Replace("CONFIRMED_CONTEXT:", "").Trim();
            else if (trimmed.StartsWith("QUESTION_"))
            {
                var q = trimmed.Substring(trimmed.IndexOf(':') + 1).Trim();
                if (!string.IsNullOrEmpty(q))
                    result.Questions.Add(q);
            }
        }

        return result;
    }
}
