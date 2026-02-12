export interface ReasoningNode {
    fact: string;
    legal_meaning: string;
    regulation: "GDPR" | "CCPA" | "FDA" | "IRS" | "Other";
    article: string;
    justification: string;
    regulation_version?: string | null;
    effective_date?: string | null;
}

export interface AnalysisOutput {
    reasoning_map: ReasoningNode[];
    risk_level: "Low" | "Medium" | "High";
    confidence: number;
    summary: string;
}

export interface ComplianceResponse {
    analysis: AnalysisOutput;
    decision: "AUTO_APPROVED" | "REVIEW_REQUIRED" | "BLOCKED";
}
