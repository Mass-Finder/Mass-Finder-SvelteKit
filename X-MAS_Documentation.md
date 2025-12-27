# X-MAS (Experimental Mass Analysis System)

## Overview

**Welcome to X-MAS**

X-MAS (Experimental Mass Analysis System) is a specialized tool for mass spectrometry (MS) analysis of peptides.

### Key Terms
1. **Used amino acid** → Amino acids and ncAA used for reaction
2. **Reinitiation** → Translation reinitiation at the second codon
3. **Trace amino acid** → Incorporation of trace amino acid

### Main Features

This tool provides two ncAA-related defined tools and two complementary approaches:

- **My ncAAs**: Define and save the chemical structures of ncAAs for use in reconstituted cell-free system (rCFS)
- **Potential Modification**: Define chemical and enzymatic modifications
- **Sequence to Mass (STM)**: Calculate the expected molecular mass of peptides from RNA sequences, considering various translation phenomena including non-canonical amino acids (ncAA) and user-defined chemical and enzymatic modifications
- **Mass to Sequence (MTS)**: Predict possible peptide sequences from observed mass using simulated annealing algorithm

Whether you're validating translation products, identifying unknown peaks, or exploring genetic code expansion experiments, X-MAS helps bridge the gap between nucleotide sequences and mass spectrometry data.

---

## 1. My ncAAs

### Purpose
Define and save the chemical structures of non-canonical amino acids for use in rCFS. This is essential for genetic code expansion experiments where you incorporate synthetic or modified amino acids into peptides.

💡 **When to use**: Use this tab before running STM or MTS calculations if your experiment involves non-canonical amino acids. Draw and save each ncAA structure once, then reuse it in multiple analyses.

### Step 1 – Draw Chemical Structure

#### Brief description
Use the ChemDoodle canvas to draw your ncAA structure.

#### Drawing tools
- **Atoms**: Click to add or change atoms (C, N, O, S, etc.)
- **Bonds**: Single, double, triple bonds
- **Rings**: Benzene, cyclohexane, and other ring structures
- **Stereochemistry**: Wedge/dash bonds for 3D configuration
- **Charges**: Add formal charges if needed

💡 **Tip**: Draw the complete structure of the amino acid residue as it would appear in a peptide chain (i.e., after condensation, without the separate -OH from COOH and -H from NH₂).

### Step 2 – Assign a Code

#### Brief description
Enter a name to label this ncAA in the analysis for this ncAA (e.g., "B", "J", "pAF", "AzF").

#### Requirements
- The name must be written without spaces (one continuous string)
- Each ncAA must have a different name
- Letters, numbers, and special characters are allowed

⚠️ **Important**: Avoid using codes that match the 20 standard amino acid abbreviations (A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y) to prevent confusion in results.

💡 **Recommendation**: Use descriptive abbreviations from literature or create your own systematic naming (e.g., "pAF" for para-azido-phenylalanine).

### Step 3 – Calculate and Save

#### Brief description
Click "save ncAA" to calculate molecular properties and save.

#### Automatically calculated
- **Molecular Formula**: Chemical formula (e.g., C₁₁H₁₂N₂O₂)
- **Monoisotopic Weight**: Mass using most abundant isotopes (for MS analysis)
- **Molecular Weight**: Average mass considering natural isotope distribution

#### Storage
All ncAAs are saved in your browser's local storage and will be available for future sessions.

#### Management
View defined ncAAs in the list below the canvas. Click "Delete" to remove any ncAA.

💡 **Tip**: Once saved, your ncAA is immediately available in both STM and MTS tabs. You can reuse it across multiple experiments without redrawing.

---

## 2. Potential Modification

### Purpose
The Potential Modification tab allows you to define chemical modifications that may occur on peptides during STM calculations. This feature is used to model post-translational modifications (PTMs), chemical reactions, and other residue-level structural changes, and to automatically generate all possible modification combinations for MS comparison.

### Workflow
💡 **Workflow**:
1. Define and save modifications in this tab
2. Move to the STM tab and select up to four saved modifications
3. Run calculation - all combinations will be generated automatically

### Step 1-1 - Modification Type: Single-site

#### Brief description
Single-site modifications affect one amino acid at a time. Choose where the modification occurs:

#### 1) Condition

##### (1) N-terminus (N-terminal modification)
- **Brief description**: Adds a chemical group to the first amino acid (N-terminus)
- **Notation**: Modification is written as a prefix (e.g., fM for formyl-methionine)
- **Target options**:
  - **ALL**: Applies to any amino acid at the N-terminus
  - **Specific amino acid**: Only applies when specific amino acid is at N-terminus (e.g., only modify if first AA is M)
- **Example**: Formylation (fMet), acetylation, biotinylation

##### (2) C-terminus (C-terminal modification)
- **Brief description**: Adds a chemical group to the last amino acid (C-terminus)
- **Notation**: Modification appears after amino acid (e.g., Mn for amidated-methionine)
- **Target options**: Same as N-terminus (ALL or specific amino acid)
- **Example**: Amidation, methylation

##### (3) Side Chain (internal modification)
- **Brief description**: Replaces a specific amino acid with its modified version throughout the entire sequence
- **Notation**: Modification replaces the amino acid letter (e.g., pS replaces S)
- **Target**: Must specify which amino acid to modify (e.g., all cysteines)
- **Combination**: System generates all possibilities (0 modified, 1 modified, 2 modified, ..., all modified)
- **Example**: Phosphorylation (pS, pT, pY), methylation (mK), acetylation (acK)

#### 2) How to define
1. Select "Single-site" type
2. Choose condition (N-terminus, C-terminus, or Side Chain)
3. Select target amino acid (All or Specific amino acid)
4. Draw the modified structure on the canvas or load from saved templates
5. Assign a structure name (short code that will appear in results, e.g., "f", "p", "ac")
6. Calculate molecular properties
7. Save the modification

⚠️ **Mass calculation**:
- **N/C-terminus**: Draw the complete modified amino acid. The system will automatically calculate the mass difference (difference from unmodified amino acid).
- **Side Chain**: Draw the full modified residue; STM replaces the original amino acid mass with this mass in calculations.

### Step 1-2 - Modification Type: Crosslinking

#### Brief description
Crosslinking modifications create chemical bonds between two amino acids in a peptide sequence.

#### 1) Common examples
- **Disulfide bonds**: Cysteine-Cysteine (C-C → S-S bridge)
- **Dityrosine**: Tyrosine-Tyrosine crosslink
- **Chemical crosslinkers**: EDC, DSS, BS3, etc.
- **Enzymatic crosslinks**: Transglutaminase-mediated Gln-Lys bonds

#### 2) Conditions (when crosslinking occurs)

##### (1) Adjacent
Two amino acids must be next to each other
- **Example**: C-C in sequence ...MCC...

##### (2) Adjacent (Target 1→2)
Target 1 must come immediately before Target 2
- **Example**: If Target 1=C, Target 2=D, only CD is valid (not DC)

##### (3) Adjacent (Target 2→1)
Target 2 must come immediately before Target 1
- Reverse of above

##### (4) Distance
Specify the number of amino acids between the two target residues.
- **= N**: Crosslink forms when the distance between the two selected residues is exactly N amino acids
- **< N**: Crosslink forms when the distance between the two selected residues is less than N amino acids
- **> N**: Crosslink forms when the distance between the two selected residues is more than N amino acids
- **Example**: If Distance = 2, the sequence ...C-X-X-C... is valid because the distance between the cysteines is two amino acids

#### 3) How to define
1. Select "Crosslinking" type
2. Select condition (Adjacent or Distance with operator and value)
3. Choose Target 1 and Target 2 (the two amino acids that will crosslink)
4. Draw the crosslinked structure (the final product of both amino acids linked together)
5. Assign a structure name (e.g., "SS" for disulfide, "XL" for generic crosslink)
6. Calculate molecular properties
7. Save the modification

#### 4) Combination generation
The system automatically generates all valid crosslinking combinations:
- **0 crosslinks**: no modification is applied
- **1 crosslink**: each valid pair is applied individually
- **2 crosslinks**: all valid non-overlapping pairs are applied
- **3 or more**: applied if the sequence contains enough residues

💡 **Example: Disulfide bonds**
- **Sequence**: MCCSTINCCM (4 cysteines)
- **Condition**: Adjacent (C-C)
- **Valid pairs**: C2-C3, C8-C9
- **Results generated**:
  - No crosslink: MCCSTINCCM
  - One crosslink: M[SS]STINCCM or MCCSTIN[SS]M
  - Two crosslinks: M[SS]STIN[SS]M

### Step 2 – Chemical Structure

#### 1. Using Load Template
Load Template allows you to reuse chemical structures you previously saved in the "Add ncAA" tab.

#### 2. Workflow
1. Go to "Add ncAA" tab and draw/save common structures (e.g., phospho-group, acetyl-group)
2. Return to Potential Modification tab
3. Click "Load Template"
4. Select the saved structure
5. The structure will load into the canvas
6. Add modification-specific information (target, condition, etc.)
7. Save as a Potential Modification

💡 **Tip**: This saves time if you use the same chemical groups repeatedly (e.g., phosphate, methyl, acetyl groups).

### Power Set Combination Logic

When you select multiple modifications in STM, the system automatically generates all possible combinations, known as a power set.

#### Why this matters
In real biological systems, modifications may or may not occur, and multiple modifications can be present simultaneously. By generating all combinations, you can identify which scenario best matches your MS data.

#### Example scenarios

##### Scenario 1: Two N-terminus modifications selected (f1, f2)
Generated results:
- 0 modifications applied
- Only f1 applied
- Only f2 applied
- Both f1 and f2 applied
- **Total**: 4 combinations (2²)

##### Scenario 2: Two N-terminus + two C-terminus modifications selected
- N-terminus combinations: 4 (as above)
- C-terminus combinations: 4 (same logic)
- **Total**: 16 combinations (4 × 4)

##### Scenario 3: Maximum selection (4 N-terminus modifications)
- **Total**: 16 combinations (2⁴)
  - 0 applied: 1 way
  - 1 applied: 4 ways
  - 2 applied: 6 ways
  - 3 applied: 4 ways
  - 4 applied: 1 way

💡 **Key insight**: You don't need to manually test each combination. Select up to 4 modifications that MIGHT be present, and the system will automatically calculate all possibilities. Then, compare the results with your MS data to identify which modifications actually occur.

⚠️ **Limitation**: Maximum 4 modifications can be selected to keep computation manageable. If you need to analyze more than 4 modifications, you can run separate calculations and compare the results.

---

## 3. Sequence to Mass (STM)

### Purpose
Calculate all possible peptide masses that could arise from an RNA sequence, considering biological phenomena such as:
- Non-canonical amino acid (ncAA) incorporation
- Translation reinitiation and premature termination
- Ribosome skipping
- Post-translational modifications
- Adduct ion formation during MS analysis

### When to use
Use STM when all translation parameters are known - such as the input RNA sequence, the non-canonical amino acids (ncAAs) and the set of amino acids used for translation, codons for ncAAs - to predict the peptide masses expected in an MS experiment. This is particularly useful for validating genetic code expansion experiments and confirming expected translation products.

### Step 1 – RNA Sequence

Enter your RNA sequence (A, U, G, C bases only).
- DNA sequences will be automatically converted to RNA (T→U)
- Sequence length must be a multiple of three (codon units)
- Translation terminates at the first stop codon (UAG, UAA, UGA)
- Sequences are saved locally for reuse

**Example**: AUGUUUGGC → Encodes Met-Phe-Gly

### Step 2 – Adduct Selection

#### Brief description
Select ion adducts that form during mass spectrometry analysis.

#### Available adducts

##### 1) Positive
- **H⁺** (Proton) - Most common in positive mode MS
- **Na⁺** (Sodium) - Common contaminant/adduct
- **K⁺** (Potassium) - Another common metal adduct
- **NH₄⁺** (Ammonium)
- **none** - Neutral mass [M]

##### 2) Negative
- **H⁻** (Proton) - Most common in positive mode MS
- **Na⁻** (Sodium) - Common contaminant/adduct
- **K⁻** (Potassium) - Another common metal adduct
- **NH₄⁻** (Ammonium)
- **none** - Neutral mass [M]

💡 **Tip**: You can select multiple adducts. The tool will generate separate results for each, displayed as [M+H]⁺, [M+Na]⁺, etc.

### Step 3 – Potential Modification (Optional)

#### Brief description
Apply custom chemical modifications to your peptides (post-translational modifications or chemical reactions).

You can select up to 4 modifications from your saved library. The system will automatically calculate all possible combinations (0, 1, 2, 3, or 4 modifications applied).

#### Modification types

##### 1) Single-site modifications
- **N-terminus**: Adds modification to the first amino acid (e.g., formylation: fM)
  - Example: Formyl-methionine formation at start codon
- **C-terminus**: Adds modification to the last amino acid (e.g., amidation: Mn)
  - Example: C-terminal amidation for peptide stability
- **Side Chain**: Replaces specific amino acids with modified versions
  - Example: Phosphorylation, methylation, acetylation

##### 2) Crosslinking modifications
- Chemical bonds between two amino acids (e.g., disulfide bonds: C-C)
- Can specify distance requirements or adjacency

💡 **Power Set Combination**: When you select multiple modifications, the system generates ALL possible combinations. For example:
- Select 2 N-terminus + 2 C-terminus mods → 16 combinations (4×4)
- Each combination represents a different biological scenario
- This ensures comprehensive coverage of all possibilities

⚠️ **Note**: First define your modifications in the "Potential Modification" tab, then select them here. See the Potential Modification section for details.

### Step 4 – Amino acids used for reaction

#### Brief description
Select which of the 20 standard amino acids are available during translation.

#### Why this matters
- Unselected amino acids won't be incorporated, even if their codons appear in the RNA sequence
- Codons for unselected amino acids may result in ribosome skipping or ncAA incorporation (if assigned)
- Useful for reconstituted cell-free system experiments with limited amino acid pools

💡 **Tip**: Select only the amino acids that were supplied in the translation reaction to reflect the experimental setup.

### Step 5 – My ncAAs

#### Brief description
Assign non-canonical amino acids to specific codons for genetic code expansion experiments.

#### Workflow
1. First, draw and save your ncAA structures in the "My ncAAs" tab (see section below)
2. Return to STM and select which ncAA you're using
3. Assign codons to each ncAA (multiple codons can be assigned to one ncAA)
4. The same codon can be assigned to different ncAAs (all possibilities will be calculated)

#### Biological phenomena modeled
- **Full incorporation**: ncAA successfully replaces natural amino acid
- **Ribosome skipping**: Codon is skipped, resulting in shorter peptide
- **Translation reinitiation**: Translation starts downstream from ncAA position (N-terminus missing)
- **Premature termination**: Translation stops at ncAA position (C-terminus missing)

💡 **Tip**: If you observe unexpected peaks in your MS data, check if they match translation reinitiation at the other codon or premature termination products.

### Step 6 – Calculate

#### Brief description
Click Calculate to generate all possible peptide masses.

#### Results include
- **Sequence**: Amino acid sequence with modification markers (e.g., fM for formyl-Met, d1 for modified Cys)
- **Monoisotopic Weight**: Most accurate mass for MS analysis
- **Molecular Weight**: Average mass considering isotope distribution
- **Adduct**: Selected ion adduct ([M+H]⁺, [M+Na]⁺, etc.)
- **Note**: Biological phenomena applied (ncAA incorporated, translation reinitiation, modifications, etc.)

💡 **Tip**: Results are automatically deduplicated. If two sequences have identical mass and adduct, only one is shown.

---

## 4. Mass to Sequence (MTS)

### Purpose
Predict possible peptide sequences from an observed mass spectrometry peak using a simulated annealing optimization algorithm.

This is particularly useful when you:
- Detect an unknown peak in your MS data
- Want to identify potential peptide sequences matching a specific mass
- Have partial sequence information to narrow down possibilities
- Need to validate or identify translation products

⚠️ **Important**: Providing as much known information as possible (RNA sequence, fixed regions, amino acid pool) significantly improves prediction accuracy and reduces computation time.

### Step 1 – Detected Mass

Enter the observed mass from your mass spectrometry peak (required).

💡 **Tips for best results**:
- Use the monoisotopic mass (most intense peak in the isotope cluster)
- Ensure the mass is calibrated and accurate
- If you selected an adduct, enter the mass including the adduct (e.g., for [M+Na]⁺, enter M+22.99)

### Step 2 – RNA Sequence (Optional, Highly Recommended)

Enter the RNA sequence used for translation if known.

#### Why this helps
- The algorithm will prioritize sequences with similar amino acid composition
- Significantly reduces meaningless results, especially for high masses
- Results are scored by both mass accuracy (95%) and sequence similarity (5%)
- Final ranking uses 90% mass accuracy + 10% sequence similarity

💡 **Strongly recommended**: Always provide the RNA sequence if available. It dramatically improves result quality.

### Step 3 – Fixed Sequence (Optional)

Enter any known regions of the peptide sequence (e.g., from MS/MS fragmentation or Edman sequencing).

#### Benefits
- All predicted sequences will contain this fixed region
- Dramatically reduces search space and improves accuracy
- Useful when you have partial sequence information from tandem MS

**Example**: If you know the peptide contains MSTINM, enter this sequence and the algorithm will only generate sequences containing this subsequence.

### Step 4 – Formylation

Specify if N-terminal formylation is present.

#### Options
- **Yes**: All predicted sequences will have formylation (adds ~28 Da to mass, denoted as 'f')
- **No**: No formylation in predicted sequences

**Background**: In bacterial translation and some eukaryotic organelles, the start codon AUG encodes formyl-methionine (fMet) instead of methionine. This adds a formyl group (CHO) to the N-terminus.

💡 **Note**: For more complex N-terminus modifications, use the Potential Modification system instead.

### Step 5 – Adduct Selection

Select the ion adduct observed in your MS peak.

The algorithm will account for the adduct mass when predicting sequences. For example, if you select [M+Na]⁺, it will subtract the sodium mass from your detected mass before searching for matching sequences.

💡 **Tip**: [M+H]⁺ is the most common adduct in positive mode ESI-MS.

### Step 6 – Amino Acids used for reaction

Select which amino acids to include in candidate sequences.

#### Why narrow the search
- Reduces computational complexity
- Improves result quality by excluding unlikely amino acids
- Useful if you know certain amino acids were not available during translation

💡 **Tip**: Keep all amino acids selected unless you have specific reasons to exclude some.

### Step 7 – Non-Canonical Amino Acids (Optional)

Include non-canonical amino acids in the search if your experiment used genetic code expansion.

First, define and save your ncAA structures in the "Add ncAA" tab, then select them here. The algorithm will consider these ncAAs as possible building blocks.

💡 **Tip**: Only select ncAAs that were actually present in your translation system.

### Step 8 – Algorithm Mode & Result Count

Select the computational intensity of the simulated annealing algorithm:

| Mode | Search Depth | Best For |
|------|--------------|----------|
| **Standard** | Balanced (10,000 initial temp) | Quick searches, low masses, or when RNA sequence is provided |
| **Think** | Thorough (50,000 initial temp) | High masses or complex sequences |
| **Deep Think** | Exhaustive (100,000 initial temp) | Maximum accuracy needed, or when other modes don't find good matches |

**Result Count**: Choose how many top results to display (20, 50, or 100).

💡 **Recommendation**: Start with Standard mode. If results aren't satisfactory, try Think or Deep Think.

### Step 9 – Calculate

Click Calculate to start the prediction.

#### Results include
- **Sequence**: Predicted amino acid sequence
- **Monoisotopic/Molecular Weight**: Calculated mass
- **Similarity**: Mass accuracy (% match to detected mass)
- **Sequence Similarity**: If RNA sequence was provided, similarity to expected translation

💡 **Interpreting results**: Top results are sorted by a combined score. Look for sequences with both high mass accuracy AND high sequence similarity (if RNA was provided).

---

## General Workflow

### Recommended order

#### 1. Preparation phase
- Define and save ncAAs (if using genetic code expansion)
- Define and save Potential Modifications (if modeling PTMs)

#### 2. Prediction phase (STM)
- Enter RNA sequence
- Configure parameters (amino acids, ncAAs, modifications)
- Calculate to get expected masses

#### 3. Identification phase (MTS)
- Take observed MS peaks
- Use MTS to identify unknown sequences
- Provide as much known information as possible

---

## Data Management

### Local storage
All your data (ncAAs, modifications, sequences) is stored in your browser. It persists across sessions but is specific to this browser.

### Backup
Currently, there's no export/import function. Keep records of your ncAA structures and modification definitions separately.

### Browser data
Clearing browser data will delete all saved structures and modifications.

### Excel export
You can export result tables to Excel for further analysis and record-keeping.

---

## Troubleshooting

### STM returns too many results
- Deselect amino acids that weren't present in your experiment
- Limit the number of selected Potential Modifications
- Check if ncAA codon assignments are correct

### MTS doesn't find good matches
- Try a higher algorithm mode (Think or Deep Think)
- Verify the detected mass is accurate
- Double-check the adduct selection
- Provide RNA sequence if available
- Check if formylation setting is correct

### Mass doesn't match expected value
- Verify ncAA structures are drawn correctly
- Check if water loss is being calculated correctly (peptide bond formation)
- Ensure adduct mass is included/excluded appropriately
- Confirm modification structures are accurate
