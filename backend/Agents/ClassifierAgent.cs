using Faultline.Services;

namespace Faultline.Agents;

public class ClassifierResult
{
    public string ErrorType { get; set; } = string.Empty;
    public string Confidence { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
}

public class ClassifierAgent
{
    private readonly AIServiceFactory _ai;

    public ClassifierAgent(AIServiceFactory ai)
    {
        _ai = ai;
    }

    public async Task<ClassifierResult> RunAsync(string rawError, CancellationToken ct = default)
    {
        var prompt = $"""
            You are a software error classifier. Analyze the error below and respond in this EXACT format with no extra text:

            ERROR_TYPE: <one of: missing_config, syntax_error, runtime_exception, network_timeout, permission_denied, dependency_missing, unknown>
            CONFIDENCE: <high, medium, or low>
            SUMMARY: <one sentence describing what went wrong>

            ERROR:
            {rawError}
            """;

        var raw = await _ai.CompleteAsync(prompt, ct);
        return Parse(raw);
    }

    private static ClassifierResult Parse(string raw)
    {
        var result = new ClassifierResult();

        foreach (var line in raw.Split('\n'))
        {
            if (line.StartsWith("ERROR_TYPE:"))
                result.ErrorType = line.Replace("ERROR_TYPE:", "").Trim();
            else if (line.StartsWith("CONFIDENCE:"))
                result.Confidence = line.Replace("CONFIDENCE:", "").Trim();
            else if (line.StartsWith("SUMMARY:"))
                result.Summary = line.Replace("SUMMARY:", "").Trim();
        }

        if (string.IsNullOrEmpty(result.ErrorType))
            result.ErrorType = "unknown";

        return result;
    }
}
