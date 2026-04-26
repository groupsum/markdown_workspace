export function createClientExtensionTrustPolicy(mode: string, dev: boolean) {
  const allowLocalDevelopmentArtifacts = dev || mode === 'test';
  return {
    allowUnsigned: allowLocalDevelopmentArtifacts,
    allowIntegrityOnly: allowLocalDevelopmentArtifacts,
  };
}
