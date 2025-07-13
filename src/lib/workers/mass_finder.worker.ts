import { MassFinderHelper } from '../helper/mass_finder_helper';

self.onmessage = (e) => {
  const { 
    detectedMass, 
    knownSequence, 
    proteinSequence,
    formylation, 
    adduct, 
    monoisotopicMap, 
    molecularMap 
  } = e.data;

  try {
    const solutions = MassFinderHelper.calcByIonType(
      detectedMass,
      knownSequence,
      formylation,
      adduct,
      monoisotopicMap,
      molecularMap,
      proteinSequence
    );
    
    self.postMessage({ type: 'success', solutions });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
}; 