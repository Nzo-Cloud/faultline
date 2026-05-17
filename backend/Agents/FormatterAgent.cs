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

            Respond in this EXACT format:

            TITLE: <short punchy title, max 8 words, e.g. "Null Reference in UserService.GetUser">
            MARKDOWN:
            ## Problem
            <one paragraph>

            ## Root Cause
            <one paragraph>

            ## Fix Applied
            <one paragraph>

            ## What I Learned
            <one paragraph>

            ## References
            <bullet list>

            Rules:
            - TITLE line must be the very first line
            - Write in first person
            - Each section is 2-4 sentences max
            - Do not add any text before TITLE:
            """;

        var raw = await _ai.CompleteAsync(prompt, ct);
        return Parse(raw);
    }

    private static FormatterResult Parse(string raw)
    {
        var result = new FormatterResult();
        var lines = raw.Split('\n');

        // Find title on any line
        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (trimmed.StartsWith("TITLE:"))
            {
                result.Title = trimmed.Replace("TITLE:", "").Trim();
                break;
            }
        }

        // Extract markdown after MARKDOWN: marker
        var mdIndex = raw.IndexOf("MARKDOWN:");
        if (mdIndex >= 0)
            result.Markdown = raw.Substring(mdIndex + "MARKDOWN:".Length).Trim();
        else
        {
            // Fallback: grab everything from first ##
            var fallback = raw.IndexOf("##");
            result.Markdown = fallback >= 0 ? raw.Substring(fallback).Trim() : raw.Trim();
        }

        // If title still empty, generate from markdown
        if (string.IsNullOrEmpty(result.Title))
            result.Title = "Debug Log Entry";

        return result;
    }
}
