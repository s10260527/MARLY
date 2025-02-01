// Controllers/ai-suggestions/aiSuggestionsController.js
const sql = require('mssql');
const aiSuggestionsDatabase = require('./aiSuggestionsDatabase');
const geminiController = require('./geminiController');

let suggestionsCache = {
    suggestions: [],
    lastUpdated: null
};

// Get all suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const [emissionsData, maintenanceData, utilityCosts] = await Promise.all([
            aiSuggestionsDatabase.getLatestEmissionsData(),
            aiSuggestionsDatabase.getMaintenanceData(),
            aiSuggestionsDatabase.getUtilityCosts()
        ]);

        const facilityData = {
            emissions: emissionsData,
            maintenance: maintenanceData,
            utilities: utilityCosts,
            facilitySummary: emissionsData.reduce((acc, facility) => {
                acc[facility.facility_name] = {
                    type: facility.facility_type,
                    sector: facility.sector_type,
                    emissions: facility.total_gross_emissions,
                    efficiency: facility.efficiency_metrics
                };
                return acc;
            }, {})
        };

        const suggestions = await geminiController.generateSuggestions(facilityData);
        
        // Update cache
        suggestionsCache = {
            suggestions: suggestions.suggestions,
            lastUpdated: new Date()
        };

        res.json(suggestions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get sector analysis
exports.getSectorAnalysis = async (req, res) => {
    try {
        const [sectorData, facilityRankings] = await Promise.all([
            aiSuggestionsDatabase.getSectorAnalysisData(),
            aiSuggestionsDatabase.getFacilityRankings()
        ]);

        res.json({
            sectorData,
            facilityRankings
        });
    } catch (error) {
        console.error('Error fetching sector analysis:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sector analysis data',
            details: error.message 
        });
    }
};

// Get equipment health
exports.getEquipmentHealth = async (req, res) => {
    try {
        const healthData = await aiSuggestionsDatabase.getEquipmentHealthData();
        res.json(healthData);
    } catch (error) {
        console.error('Error fetching equipment health:', error);
        res.status(500).json({ 
            error: 'Failed to fetch equipment health data',
            details: error.message 
        });
    }
};

// Get implementation progress
exports.getImplementationProgress = async (req, res) => {
    try {
        const progressData = await aiSuggestionsDatabase.getImplementationProgress();
        res.json(progressData);
    } catch (error) {
        console.error('Error fetching implementation progress:', error);
        res.status(500).json({ 
            error: 'Failed to fetch implementation progress data',
            details: error.message 
        });
    }
};

// Get suggestion details
exports.getSuggestionDetails = async (req, res) => {
    try {
        const suggestionId = req.params.id;
        
        // Find the specific suggestion from cache
        const suggestion = suggestionsCache.suggestions.find(s => s.id === suggestionId);
        
        if (!suggestion) {
            console.error('Suggestion not found:', suggestionId);
            return res.status(404).json({ 
                error: 'Suggestion not found',
                message: 'The requested suggestion details are not available.'
            });
        }

        const [emissionsData, maintenanceData, utilityCosts] = await Promise.all([
            aiSuggestionsDatabase.getLatestEmissionsData(),
            aiSuggestionsDatabase.getMaintenanceData(),
            aiSuggestionsDatabase.getUtilityCosts()
        ]);

        const facilityData = {
            emissions: emissionsData,
            maintenance: maintenanceData,
            utilities: utilityCosts,
            suggestion: suggestion
        };

        const details = await geminiController.generateDetailedSuggestion(facilityData, suggestionId);
        res.json(details);
    } catch (error) {
        console.error('Error generating suggestion details:', error);
        res.status(500).json({ 
            error: 'Failed to generate suggestion details',
            message: error.message
        });
    }
};