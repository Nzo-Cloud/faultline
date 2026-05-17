using Faultline.Services;

namespace Faultline.Agents;

public class ResearcherResult
{
    public string KnownPattern { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
    public List<string> References { get; set; } = new();
}

public class ResearcherAgent
{
    private readonly AIServiceFactory _ai;

    public ResearcherAgent(AIServiceFactory ai)
    {
        _ai = ai;
    }

    public async Task<ResearcherResult> RunAsync(
        AnalyzerResult analysis,
        ClassifierResult classification,
        CancellationToken ct = default)
    {
        var prompt = $"""
            You are a software engineering researcher identifying known patterns for a bug.

            ERROR TYPE: {classification.ErrorType}
            ROOT CAUSE: {analysis.RootCause}
            FIX: {analysis.Fix}

            Respond in this EXACT format with no extra text:

            KNOWN_PATTERN: <one sentence — is this a common known issue? e.g. "This is a classic null reference pattern in C# when dependency injection is misconfigured.">
            CONTEXT: <one sentence — when does this typically occur in real projects?>
            REFERENCE_1: <relevant doc, article, or resource title and URL if known>
            REFERENCE_2: <second reference if applicable, otherwise write NONE>
            """;

        var raw = await _ai.CompleteAsync(prompt, ct);
        return Parse(raw);
    }

    private static ResearcherResult Parse(string raw)
    {
        var result = new ResearcherResult();

        foreach (var line in raw.Split('\n'))
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("KNOWN_PATTERN:"))
                result.KnownPattern = trimmed.Replace("KNOWN_PATTERN:", "").Trim();
            else if (trimmed.StartsWith("CONTEXT:"))
                result.Context = trimmed.Replace("CONTEXT:", "").Trim();
            else if (trimmed.StartsWith("REFERENCE_") && !trimmed.Contains("NONE"))
            {
                var ref_ = trimmed.Substring(trimmed.IndexOf(':') + 1).Trim();
                if (!string.IsNullOrEmpty(ref_))
                    result.References.Add(ref_);
            }
        }

        return result;
    }
}
