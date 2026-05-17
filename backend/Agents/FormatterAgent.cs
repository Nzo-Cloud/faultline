using Faultline.Services;

namespace Faultline.Agents;

public class FormatterResult
{
    public string Title { get; set; } = string.Empty;
    public string Markdown { get; set; } = string.Empty;
}

public class FormatterAgent
{
    private readonly AIServiceFactory _ai;

    public FormatterAgent(AIServiceFactory ai)
    {
        _ai = ai;
    }

    public async Task<FormatterResult> RunAsync(
        string rawError,
        ClassifierResult classification,
        ClarifierResult clarification,
        AnalyzerResult analysis,
        ResearcherResult research,
        CancellationToken ct = default)
    {
        var prompt = $"""
            You are a technical writer formatting a Debug Log entry for a developer's portfolio.

            INPUT SUMMARY:
            - Error Type: {classification.ErrorType}
            - Summary: {classification.Summary}
            - Confirmed Context: {clarification.ConfirmedContext}
            - Root Cause: {analysis.RootCause}
            - Explanation: {analysis.Explanation}
            - Fix: {analysis.Fix}
            - Known Pattern: {research.KnownPattern}
            - References: {string.Join(", ", research.References)}

            Format this as a Debug Log entry using this EXACT markdown structure:

            TITLE: <short punchy title, max 8 words, e.g. "Null Reference in UserService.GetUser">

            MARKDOWN:
            ## Problem
            <one paragraph describing what went wrong and when>

            ## Root Cause
            <one paragraph explaining the exact technical reason>

            ## Fix Applied
            <one paragraph describing what was changed to fix it>

            ## What I Learned
            <one paragraph — key takeaway for the developer>

            ## References
            <bullet list of references, or "None" if empty>

            Write in first person as if the developer is documenting their own fix.
            Be concise. Each section is 2-4 sentences max.
            """;

        var raw = await _ai.CompleteAsync(prompt, ct);
        return Parse(raw);
    }

    private static FormatterResult Parse(string raw)
    {
        var result = new FormatterResult();
        var lines = raw.Split('\n');

        foreach (var line in lines)
        {
            if (line.StartsWith("TITLE:"))
            {
                result.Title = line.Replace("TITLE:", "").Trim();
                break;
            }
        }

        var mdStart = raw.IndexOf("MARKDOWN:");
        if (mdStart >= 0)
            result.Markdown = raw.Substring(mdStart + "MARKDOWN:".Length).Trim();
        else
            result.Markdown = raw.Trim();

        return result;
    }
}
