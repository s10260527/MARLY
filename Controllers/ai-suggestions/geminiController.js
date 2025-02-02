// server/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../../dbConfig');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, {apiVersion: 'v1beta',});

function extractJSONFromMarkdown(markdownText) {
    try {
        // Remove markdown code block indicators and any other markdown syntax
        const cleanText = markdownText
            .replace(/```json\n?/g, '')  // Remove ```json
            .replace(/```\n?/g, '')      // Remove closing ```
            .trim();                     // Remove extra whitespace

        // Parse the cleaned text as JSON
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error parsing JSON from markdown:', error);
        throw new Error('Failed to parse Gemini response');
    }
}

async function generateSuggestions(data) {
  try {
      const prompt = `
      You are an AI sustainability advisor analyzing multiple facilities' data to provide strategic recommendations.
      Analyze this data to identify opportunities across all facilities:

      Emissions Data:
      ${JSON.stringify(data.emissions, null, 2)}

      Maintenance Data:
      ${JSON.stringify(data.maintenance, null, 2)}

      Utility Data:
      ${JSON.stringify(data.utilities, null, 2)}

      Provide 12-15 actionable suggestions that include:
      1. Cross-facility optimizations
      2. Facility-specific improvements
      3. Equipment and maintenance optimizations
      4. Energy efficiency opportunities
      5. Cost reduction strategies
      6. Emission reduction initiatives

      For each suggestion, specify:
      - Which facilities it applies to
      - Whether it's a global or facility-specific initiative
      - Concrete implementation steps
      - Expected impact across relevant facilities

      Provide at least 3 suggestions for each "category": "Emissions/Costs/Both".

      Respond only with a JSON object in this exact format, with no additional text or explanation:
      {
        "suggestions": [
          {
            "id": "auto-generated",
            "title": "Clear, actionable title",
            "description": "Detailed description",
            "priority": "High/Medium/Low",
            "category": "Emissions/Costs/Both",
            "facilities": ["specific facilities or 'All'"],
            "impact": "Quantified impact",
            "timeline": "Implementation timeline",
            "roi": "Expected ROI",
            "trend": "improvement trend as number",
            "completion": "current completion percentage",
            "type": "Global/Facility-Specific"
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      let suggestions;
      try {
          suggestions = JSON.parse(responseText);
      } catch (error) {
          suggestions = extractJSONFromMarkdown(responseText);
      }

      // Add unique IDs and ensure all fields exist
      suggestions.suggestions = suggestions.suggestions.map((suggestion, index) => ({
          ...suggestion,
          id: `suggestion-${Date.now()}-${index}`,
          facilities: suggestion.facilities || ['All'],
          type: suggestion.type || 'Global',
          completion: suggestion.completion || 0,
          trend: suggestion.trend || 0
      }));

      return suggestions;
  } catch (error) {
      console.error('Gemini API Error:', error);
      return {
          suggestions: [
              {
                  id: `suggestion-${Date.now()}-0`,
                  title: "System Error - Using Default Suggestions",
                  description: "Unable to generate real-time suggestions. Please try again later.",
                  priority: "High",
                  category: "Both",
                  facilities: ["All"],
                  impact: "N/A",
                  timeline: "Immediate attention required",
                  roi: "N/A",
                  trend: 0,
                  completion: 0,
                  type: "Global"
              }
          ]
      };
  }
}

async function generateDetailedSuggestion(data, suggestionId) {
  try {
      if (!data.suggestion) {
          throw new Error('No suggestion data provided');
      }

      const prompt = `
      You are an AI sustainability advisor providing a detailed analysis of a specific sustainability suggestion.
      Focus on creating a practical, actionable implementation plan for this exact suggestion.

      Current Facility Data:
      - Emissions Data: ${JSON.stringify(data.emissions, null, 2)}
      - Maintenance Data: ${JSON.stringify(data.maintenance, null, 2)}
      - Utility Costs: ${JSON.stringify(data.utilities, null, 2)}

      Specific Suggestion to Analyze:
      - Title: ${data.suggestion.title}
      - Category: ${data.suggestion.category}
      - Priority: ${data.suggestion.priority}
      - Initial Description: ${data.suggestion.description}
      - Expected Impact: ${data.suggestion.impact}
      - Timeline: ${data.suggestion.timeline}
      - ROI: ${data.suggestion.roi}

      Based on this specific suggestion and the facility data, provide:
      1. A detailed current state analysis
      2. Specific impact areas with quantified potential improvements
      3. Step-by-step implementation plan
      4. Concrete monitoring criteria and KPIs

      Focus on making all estimates and projections specific to this facility's actual data.

      Respond only with a JSON object in this exact format, with no additional text or explanation:
      {
        "analysis": {
          "current_state": "Detailed analysis of current situation based on facility data",
          "impact_areas": ["Specific areas affected by this suggestion"],
          "potential_savings": {
            "cost": "Projected annual cost savings in USD",
            "emissions": "Projected annual emissions reduction in MT",
            "efficiency": "Projected efficiency improvement percentage"
          }
        },
        "implementation": {
          "steps": [
            {
              "step": 1,
              "title": "Step title",
              "description": "Detailed step description",
              "timeline": "Expected duration",
              "resources_needed": ["Required resources"],
              "dependencies": ["Prerequisites or dependencies"]
            }
          ],
          "estimated_completion_time": "Total implementation timeline",
          "total_cost": "Implementation cost estimate",
          "roi_period": "Time to achieve ROI"
        },
        "monitoring": {
          "kpis": ["Specific measurable KPIs"],
          "measurement_frequency": "How often to measure",
          "success_criteria": ["Specific success metrics"],
          "verification_methods": ["How to verify improvements"]
        }
      }`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      try {
          return JSON.parse(responseText);
      } catch (error) {
          return extractJSONFromMarkdown(responseText);
      }
  } catch (error) {
      console.error('Error generating detailed suggestion:', error);
      throw error;
  }
}

module.exports = {
    generateSuggestions,
    generateDetailedSuggestion
};