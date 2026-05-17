using Microsoft.AspNetCore.Mvc;
using Faultline.Agents;

namespace Faultline.Controllers;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    private readonly ClassifierAgent _classifier;
    private readonly ClarifierAgent _clarifier;
    private readonly AnalyzerAgent _analyzer;
    private readonly ResearcherAgent _researcher;
    private readonly FormatterAgent _formatter;

    public TestController(
        ClassifierAgent classifier,
        ClarifierAgent clarifier,
        AnalyzerAgent analyzer,
        ResearcherAgent researcher,
        FormatterAgent formatter)
    {
        _classifier = classifier;
        _clarifier = clarifier;
        _analyzer = analyzer;
        _researcher = researcher;
        _formatter = formatter;
    }

    [HttpPost("classify")]
    public async Task<IActionResult> Classify([FromBody] string error)
    {
        var classification = await _classifier.RunAsync(error);
        var clarification = await _clarifier.RunAsync(error, classification);

        var confirmedContext = clarification.NeedsClarification
            ? "C# ASP.NET Core, local development environment"
            : clarification.ConfirmedContext;

        var analysis = await _analyzer.RunAsync(error, classification, confirmedContext);
        var research = await _researcher.RunAsync(analysis, classification);
        var formatted = await _formatter.RunAsync(
            error, classification, clarification, analysis, research);

        return Ok(new { classification, clarification, analysis, research, formatted });
    }
}
