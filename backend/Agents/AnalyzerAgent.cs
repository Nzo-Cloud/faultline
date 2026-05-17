using Faultline.Services;

namespace Faultline.Agents;

public class AnalyzerResult
{
    public string RootCause { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string Fix { get; set; } = string.Empty;
}

public class AnalyzerAgent
{
    private readonly AIServiceFactory _ai;

    public AnalyzerAgent(AIServiceFactory ai)
    {
        _ai = ai;
    }

    public async Task<AnalyzerResult> RunAsync(
        string rawError,
        ClassifierResult classification,
        string confirmedContext,
        CancellationToken ct = default)
    {
        var prompt = $"""
            You are an expert software debugger performing deep root cause analysis.

            ERROR TYPE: {classification.ErrorType}
            SUMMARY: {classification.Summary}
            CONFIRMED CONTEXT: {confirmedContext}

            RAW ERROR:
            {rawError}

            Analyze this error and respond in this EXACT format with no extra text:

            ROOT_CAUSE: <one sentence — the exact technical reason this error occurred>
            EXPLANATION: <2-3 sentences — why this happens, what triggered it>
            FIX: <concrete fix — what code or config change solves this>
            """;

        var raw = await _ai.CompleteAsync(prompt, ct);
        return Parse(raw);
    }

    private static AnalyzerResult Parse(string raw)
    {
        var result = new AnalyzerResult();

        foreach (var line in raw.Split('\n'))
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("ROOT_CAUSE:"))
                result.RootCause = trimmed.Replace("ROOT_CAUSE:", "").Trim();
            else if (trimmed.StartsWith("EXPLANATION:"))
                result.Explanation = trimmed.Replace("EXPLANATION:", "").Trim();
            else if (trimmed.StartsWith("FIX:"))
                result.Fix = trimmed.Replace("FIX:", "").Trim();
        }

        return result;
    }
}
