import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5031';

export interface AnalyzeRequest {
  error: string;
  userContext?: string;
}

export interface AnalysisResponse {
  classification: {
    errorType: string;
    confidence: string;
    summary: string;
  };
  clarification: {
    needsClarification: boolean;
    questions: string[];
    confirmedContext: string;
  };
  analysis: {
    rootCause: string;
    explanation: string;
    fix: string;
  };
  research: {
    knownPattern: string;
    context: string;
    references: string[];
  };
  formatted: {
    title: string;
    markdown: string;
  };
  needsUserInput: boolean;
}

export async function analyzeError(request: AnalyzeRequest): Promise<AnalysisResponse> {
  const response = await axios.post(`${API_URL}/api/analysis/analyze`, request);
  return response.data;
}
