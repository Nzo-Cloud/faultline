using Microsoft.AspNetCore.Mvc;
using Faultline.Agents;
using Faultline.Services;

namespace Faultline.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly ClassifierAgent _classifier;
    private readonly ClarifierAgent _clarifier;
    private readonly AnalyzerAgent _analyzer;
    private readonly ResearcherAgent _researcher;
    private readonly FormatterAgent _formatter;
    private readonly RateLimitService _rateLimit;
    private readonly QueueService _queue;

    public AnalysisController(
        ClassifierAgent classifier,
        ClarifierAgent clarifier,
        AnalyzerAgent analyzer,
        ResearcherAgent researcher,
        FormatterAgent formatter,
        RateLimitService rateLimit,
        QueueService queue)
    {
        _classifier = classifier;
        _clarifier = clarifier;
        _analyzer = analyzer;
        _researcher = researcher;
        _formatter = formatter;
        _rateLimit = rateLimit;
        _queue = queue;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] AnalyzeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Error))
            return BadRequest(new { error = "Error input cannot be empty." });

        if (request.Error.Length > 3000)
            return BadRequest(new { error = "Input too long. Maximum 3,000 characters." });

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var rateLimitResult = _rateLimit.Check(ip);
        if (!rateLimitResult.IsAllowed)
            return StatusCode(429, new { error = rateLimitResult.Message });

        var queueEntry = await _queue.EnqueueAsync();
        if (!queueEntry.IsAccepted)
            return StatusCode(503, new { error = queueEntry.Message });

        try
        {
            _rateLimit.Record(ip);

            var classification = await _classifier.RunAsync(request.Error);
            await Task.Delay(500);

            var clarification = await _clarifier.RunAsync(request.Error, classification);
            await Task.Delay(500);

            var confirmedContext = !string.IsNullOrEmpty(request.UserContext)
                ? request.UserContext
                : clarification.ConfirmedContext;

            var analysis = await _analyzer.RunAsync(request.Error, classification, confirmedContext);
            await Task.Delay(500);

            var research = await _researcher.RunAsync(analysis, classification);
            await Task.Delay(500);

            var formatted = await _formatter.RunAsync(
                request.Error, classification, clarification, analysis, research);

            return Ok(new
            {
                classification,
                clarification,
                analysis,
                research,
                formatted,
                needsUserInput = clarification.NeedsClarification && string.IsNullOrEmpty(request.UserContext)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Our AI is taking a short break ☕ Please try again in ~60 seconds.", detail = ex.Message });
        }
        finally
        {
            _queue.Release();
        }
    }
}

public class AnalyzeRequest
{
    public string Error { get; set; } = string.Empty;
    public string? UserContext { get; set; }
}
