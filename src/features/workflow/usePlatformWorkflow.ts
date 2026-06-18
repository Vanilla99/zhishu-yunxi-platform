import { useState } from "react";
import {
  experiments,
  initialAnalysisJobs,
  initialPilotLeads,
  reports,
  type AnalysisJob,
  type Experiment,
  type ExperimentFile,
  type PageKey,
  type PilotLead,
  type Report,
} from "../../data/platformData";
import {
  createAnalysisJob,
  createExperimentFromDraft,
  createPilotLead,
  createReportFromJob,
  type ExperimentDraft,
  type PilotDraft,
} from "../../data/mockService";

type AppState = {
  page: PageKey;
  selectedExperimentId: string;
  selectedReportId: string;
};

type AnalysisSignal = {
  completedExperimentId: string;
  generatedReportId: string;
};

function getReportForExperiment(experimentId: string, reportRows: Report[]) {
  return (
    reportRows.find((report) => report.experimentId === experimentId) ??
    reportRows[0] ??
    reports[0]
  );
}

export function usePlatformWorkflow() {
  const [experimentRows, setExperimentRows] = useState<Experiment[]>(() => experiments);
  const [reportRows, setReportRows] = useState<Report[]>(() => reports);
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>(() => initialAnalysisJobs);
  const [pilotLeads, setPilotLeads] = useState<PilotLead[]>(() => initialPilotLeads);
  const [state, setState] = useState<AppState>({
    page: "home",
    selectedExperimentId: experiments[0].id,
    selectedReportId: reports[0].id,
  });
  const [analysisSignal, setAnalysisSignal] = useState<AnalysisSignal>({
    completedExperimentId: experiments[0].id,
    generatedReportId: reports[0].id,
  });

  const navigate = (page: PageKey) => {
    setState((current) => ({ ...current, page }));
  };

  const selectExperiment = (experimentId: string, page?: PageKey) => {
    const relatedReport = getReportForExperiment(experimentId, reportRows);
    setState((current) => ({
      ...current,
      selectedExperimentId: experimentId,
      selectedReportId: relatedReport.id,
      page: page ?? current.page,
    }));
  };

  const selectReport = (reportId: string, page?: PageKey) => {
    const relatedReport = reportRows.find((item) => item.id === reportId);
    setState((current) => ({
      ...current,
      selectedReportId: reportId,
      selectedExperimentId: relatedReport?.experimentId ?? current.selectedExperimentId,
      page: page ?? current.page,
    }));
  };

  const openReportForExperiment = (experimentId: string) => {
    const relatedReport = getReportForExperiment(experimentId, reportRows);
    setState((current) => ({
      ...current,
      selectedExperimentId: experimentId,
      selectedReportId: relatedReport.id,
      page: "reports",
    }));
  };

  const importExperiment = (draft: ExperimentDraft, files: ExperimentFile[]) => {
    const experiment = createExperimentFromDraft(draft, files, experimentRows.length);
    setExperimentRows((current) => [experiment, ...current]);
    setState((current) => ({
      ...current,
      selectedExperimentId: experiment.id,
      page: "experiments",
    }));
    return experiment;
  };

  const createJobForActiveExperiment = (tasks: string[]) => {
    return createAnalysisJob(activeExperiment, tasks);
  };

  const upsertAnalysisJob = (job: AnalysisJob) => {
    setAnalysisJobs((current) => {
      const exists = current.some((item) => item.id === job.id);
      return exists
        ? current.map((item) => (item.id === job.id ? job : item))
        : [job, ...current];
    });
  };

  const completeAnalysisJob = (job: AnalysisJob) => {
    const experiment =
      experimentRows.find((item) => item.id === job.experimentId) ?? experimentRows[0];
    const report = createReportFromJob(job, experiment, reportRows);
    const completedJob: AnalysisJob = {
      ...job,
      status: "已完成",
      progress: 100,
      currentStage: "report",
      reportId: report.id,
      updatedAt: report.generatedAt,
      failureReason: undefined,
    };

    setAnalysisJobs((current) =>
      current.map((item) => (item.id === job.id ? completedJob : item)),
    );
    setReportRows((current) => [report, ...current.filter((item) => item.id !== report.id)]);
    setExperimentRows((current) =>
      current.map((item) =>
        item.id === job.experimentId
          ? {
              ...item,
              status: "已完成",
              reportReady: true,
              confidence: Math.max(item.confidence, report.score),
              lastAnalysis: report.generatedAt,
              keyFinding: report.conclusion,
            }
          : item,
      ),
    );
    setAnalysisSignal({
      completedExperimentId: job.experimentId,
      generatedReportId: report.id,
    });
    setState((current) => ({
      ...current,
      selectedExperimentId: job.experimentId,
      selectedReportId: report.id,
    }));
  };

  const retryAnalysisJob = (jobId: string) => {
    setAnalysisJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "排队中",
              progress: 0,
              currentStage: "validate",
              failureReason: undefined,
            }
          : job,
      ),
    );
  };

  const addPilotLead = (draft: PilotDraft) => {
    const lead = createPilotLead(draft, pilotLeads.length);
    setPilotLeads((current) => [lead, ...current]);
    return lead;
  };

  const activeExperiment =
    experimentRows.find((item) => item.id === state.selectedExperimentId) ??
    experimentRows[0];
  const activeReport =
    reportRows.find((item) => item.id === state.selectedReportId) ?? reportRows[0];

  return {
    state,
    experimentRows,
    reportRows,
    analysisJobs,
    pilotLeads,
    analysisSignal,
    activeExperiment,
    activeReport,
    navigate,
    selectExperiment,
    selectReport,
    openReportForExperiment,
    importExperiment,
    createJobForActiveExperiment,
    upsertAnalysisJob,
    completeAnalysisJob,
    retryAnalysisJob,
    addPilotLead,
  };
}
