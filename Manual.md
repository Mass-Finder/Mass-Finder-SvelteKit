# X-MAS User Manual

**X-MAS (Experimental Mass Analysis System)** is a specialized tool designed for biochemical researchers working with mass spectrometry (MS) analysis of peptides and proteins.

## Table of Contents

1. [Introduction](#introduction)
2. [Sequence to Mass (STM)](#sequence-to-mass-stm)
3. [Mass to Sequence (MTS)](#mass-to-sequence-mts)
4. [Add Non-Canonical Amino Acids (ncAA)](#add-non-canonical-amino-acids-ncaa)
5. [Potential modifications](#potential-modifications)
6. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

### What is X-MAS?

X-MAS is a specialized tool designed for biochemical researchers working with mass spectrometry (MS) analysis of peptides and proteins.

### Key Features

- **Sequence to Mass (STM)**: Predict masses from RNA sequences with support for translation phenomena (reinitiation, premature termination, ribosome skipping)
- **Mass to Sequence (MTS)**: Reverse-engineer amino acid sequences from detected masses using simulated annealing algorithms
- **Chemical Structure Drawing**: Design and calculate masses for non-canonical amino acids (ncAAs)
- **Potential modifications**: Model post-translational modifications (PTMs) and crosslinking events

### Who Should Use X-MAS?

- Researchers studying genetic code expansion with non-canonical amino acids
- Scientists analyzing mass spectrometry data from protein samples
- Labs working with modified peptides and post-translational modifications
- Anyone needing to predict or validate translation products

Whether you're validating translation products, identifying unknown peaks, or exploring genetic code expansion experiments, X-MAS helps bridge the gap between nucleotide sequences and mass spectrometry data.

---

## Sequence to Mass (STM)

### Overview

**When to use**: Use STM when you have an RNA sequence and want to predict what masses you should observe in your MS experiment.

STM converts nucleotide sequences into predicted amino acid sequences and their corresponding masses, accounting for biological phenomena like reinitiation, premature termination, and ribosome skipping.

### Step-by-Step Guide

#### Step 1: Input RNA sequence

**What you need**: Your RNA sequence in standard nucleotide format (A, U, G, C)

- Paste your RNA sequence into the input field
- No need to remove spaces or line breaks - the system handles formatting automatically
- Both DNA (T) and RNA (U) notations are accepted

**💡 Tip**: Keep a copy of your original sequence in a text file for reference.

**⚠️ Important**: The sequence should start with a start codon (AUG) and end with a stop codon (UAA, UAG, or UGA) for standard translation. However, reinitiation and other phenomena can occur at internal positions.

#### Step 2: Select Translation Phenomena

**Available options**:

- **Reinitiation**: Translation restarts at an internal AUG after a stop codon
- **Premature Termination**: Translation stops early at a stop codon before the expected end
- **Ribosome Skipping**: Ribosome skips certain codons during translation

**When to use these**:

- **Reinitiation**: Common in polycistronic mRNAs or when studying alternative translation products
- **Premature Termination**: Important when analyzing truncated proteins or nonsense mutations
- **Ribosome Skipping**: Relevant for certain viral translation mechanisms or when studying programmed frameshifting

**💡 Tip**: If you're not sure which phenomena apply, start with all three selected. You can filter results later.

#### Step 3: Configure Non-Canonical Amino Acids (ncAAs)

**What this does**: Allows the system to replace specific codons with non-canonical amino acids instead of their standard amino acid.

**Steps**:

1. Click "+ Add ncAA" to create a new ncAA configuration
2. For each ncAA:
   - **Name/Code**: Enter the abbreviation (e.g., "pAF" for para-azido-phenylalanine)
   - **Select Codons**: Choose which codons should be translated to this ncAA
   - **Incorporation Rate**: Set the probability (0-100%) that the ncAA is incorporated vs. the standard amino acid

**Example scenario**:

- You're using an amber suppressor tRNA that reads UAG codons
- You want UAG to potentially incorporate pAF instead of terminating
- Set: Code = "pAF", Codons = "UAG", Rate = 100%

**💡 Tip**: You can add multiple ncAAs if your system uses multiple orthogonal tRNA/synthetase pairs.

**⚠️ Important**: Make sure you've already drawn and saved your ncAA structure in the "Add ncAA" section before configuring it here.

#### Step 4: Configure Potential modifications

**What this does**: Models post-translational modifications (PTMs) and crosslinking events that may or may not occur in your sample.

**Two types available**:

**Single-site modifications**:
- **N-terminus**: Modifications to the first amino acid (e.g., formylation, acetylation)
- **C-terminus**: Modifications to the last amino acid (e.g., amidation)
- **Side Chain**: Modifications to specific amino acid side chains (e.g., phosphorylation of S/T/Y)

**Crosslinking modifications**:
- Links between two amino acids (e.g., disulfide bonds between cysteines)

**Steps**:

1. Click "Add Potential Modification"
2. Choose modification type (Single-site or Crosslinking)
3. Draw the modification structure or load from templates
4. Set the target amino acid(s)
5. Set conditions (e.g., "only if methionine is at position 1")

**💡 Power Set Logic**: When you select multiple potential modifications (up to 4), the system automatically calculates ALL possible combinations:
- 0 modifications applied
- Only 1 modification applied
- Only 2 modifications applied
- All modifications applied
- etc.

**Example**: If you select 2 N-terminus modifications (formylation, acetylation), you'll get 4 combinations (2²):
- Neither applied
- Only formylation
- Only acetylation
- Both applied

#### Step 5: Select Ion Adducts

**What this does**: Specifies which ion forms you expect to observe in your mass spectrometer.

**Available adducts**:
- **[M+H]⁺**: Protonated molecule (most common in positive mode)
- **[M+Na]⁺**: Sodium adduct
- **[M+K]⁺**: Potassium adduct
- **[M+2H]²⁺**: Doubly protonated (common for larger peptides)
- And more...

**💡 Tip**: Select all adducts that your MS instrument typically detects. This gives you a complete picture of expected peaks.

**Best practice**: For peptide analysis, always include [M+H]⁺ and [M+2H]²⁺ at minimum.

#### Step 6: Calculate

Click the "Calculate" button to generate all possible sequences and their masses.

**What happens**:
1. System generates all possible amino acid sequences based on:
   - RNA sequence
   - Selected translation phenomena
   - ncAA incorporation probabilities
   - Potential modifications (all combinations)
2. Calculates monoisotopic weight for each sequence
3. Applies ion adducts
4. Displays results sorted by mass

**💡 Tip**: Results are displayed in a table with sequence, mass, adduct type, and any modifications applied. You can sort and filter as needed.

---

## Mass to Sequence (MTS)

### Overview

**When to use**: Use MTS when you have detected masses in your MS experiment and want to determine what amino acid sequences could produce those masses.

MTS uses simulated annealing algorithms to search for amino acid sequences that match your observed masses.

### Step-by-Step Guide

#### Step 1: Input Detected Masses

**What you need**: The m/z values you observed in your mass spectrum

- Enter masses one per line in the text area
- Use decimal notation (e.g., 1234.5678)
- Masses should be monoisotopic values

**💡 Tip**: Copy masses directly from your MS software export. Remove any extra columns or labels - just the numbers.

#### Step 2: (Optional but Recommended) Input RNA sequence

**Why this helps**: If you provide the RNA sequence that produced these masses, the algorithm can:
- Use the expected amino acid composition as a starting point
- Compare results against the known sequence
- Run much faster with higher accuracy

**When to skip this**: If you're doing de novo sequencing without any prior knowledge of the source sequence.

**💡 Best practice**: Always provide the RNA sequence if available. This dramatically improves results.

#### Step 3: Select Translation Phenomena

Same as STM - select which biological phenomena might have occurred:
- Reinitiation
- Premature Termination
- Ribosome Skipping

**💡 Tip**: If you selected these in STM, use the same settings in MTS for consistency.

#### Step 4: Configure Non-Canonical Amino Acids

Same as STM - define any ncAAs that might be present in your sequences.

**⚠️ Important**: Only include ncAAs that you actually used in your experiment. Adding unnecessary ncAAs increases search space and reduces accuracy.

#### Step 5: Configure Potential modifications

Same as STM - define any PTMs or crosslinking events that might be present.

#### Step 6: Select Ion Adducts

Same as STM - select which ion forms you detected in your spectrum.

**💡 Tip**: If you're not sure which adduct a peak represents, select all common ones. The algorithm will test all possibilities.

#### Step 7: Set Minimum Sequence Length

**What this does**: Filters out very short sequences that are unlikely to be real products.

**Default**: 3 amino acids

**When to change**:
- Increase for larger expected products
- Decrease if you're specifically looking for short peptides

#### Step 8: Configure Algorithm Mode & Result Count

**Algorithm Modes**:

| Mode | Search Depth | Initial Temperature | Best For |
|------|-------------|---------------------|----------|
| **Think** | Balanced | 10,000 | Quick searches, low masses, or when RNA sequence is provided |
| **Deep Think** | Thorough | 20,000 | Complex sequences, higher masses, or when no RNA sequence available |
| **Ultra Think** | Exhaustive | 50,000 | Maximum accuracy needed, willing to wait longer |

**Result Count**: Number of top results to return for each mass (default: 10)

**💡 Choosing the right mode**:
- Start with "Think" mode - it's fast and works well most of the time
- Use "Deep Think" if initial results don't match expectations
- Use "Ultra Think" only for critical analyses where you need maximum confidence

**⚠️ Note**: Ultra Think mode can take significantly longer (minutes instead of seconds).

#### Step 9: Calculate

Click "Calculate" to start the simulated annealing search.

**What happens**:
1. For each input mass, the algorithm searches for amino acid sequences that produce that mass
2. Uses simulated annealing optimization with temperature-based exploration
3. Scores sequences based on:
   - **Mass accuracy** (80% weight): How close the sequence mass is to target
   - **Sequence similarity** (20% weight): How similar to the RNA-derived sequence (if provided)
4. Returns top N results sorted by fitness score

**💡 Tip**: Results include the sequence, calculated mass, mass error, adduct type, and fitness score. Higher fitness scores indicate better matches.

---

## Add Non-Canonical Amino Acids (ncAA)

### Overview

**When to use**: Before running STM or MTS calculations with non-canonical amino acids, you must first draw their chemical structures and calculate their masses.

### Step-by-Step Guide

#### Step 1: Draw Chemical Structure

**Tools available**:
- **Atoms**: C, N, O, S, P, F, Cl, Br, I
- **Bonds**: Single, double, triple, wedge (stereochemistry)
- **Rings**: Benzene, cyclopentane, cyclohexane
- **Functional groups**: Common groups like -NH₂, -COOH, -OH

**How to use ChemDoodle**:
1. Select the drawing tool from the toolbar
2. Click on the canvas to add atoms/bonds
3. Click and drag to draw bonds between atoms
4. Right-click for more options (e.g., changing atom type)

**💡 Tip**: Draw the complete structure of the amino acid residue as it would appear in a peptide chain (i.e., after condensation, without the separate -OH from COOH and -H from NH₂).

**Templates available**: Click "Load template" to choose from pre-drawn common ncAAs:
- para-azido-phenylalanine (pAF)
- para-propargyloxy-phenylalanine (pPa)
- Pyrrolysine (Pyl)
- And more...

**⚠️ Important**: Make sure the structure is chemically correct. Incorrect structures will give wrong mass calculations.

#### Step 2: Assign Name/Code

**What you need**: A short code to represent this ncAA in sequences

- Use standard abbreviations when available (e.g., "Pyl" for pyrrolysine)
- For custom ncAAs, use descriptive codes (e.g., "pAF", "pPa")
- Keep it short (1-4 characters) for easy reading in sequence outputs

**💡 Naming recommendations**:
- Use lowercase prefixes for positions (p = para, m = meta, o = ortho)
- Use capital letters for the base amino acid
- Be consistent across your experiments

#### Step 3: Calculate and Save

Click "Calculate Weight" to:
1. Analyze the drawn structure
2. Calculate monoisotopic weight
3. Save to browser local storage

**What you'll see**:
- **Monoisotopic Weight**: The exact mass based on most abundant isotopes
- **Molecular Formula**: Chemical formula of your structure

**⚠️ Important**: Data is saved in your browser's local storage, so it persists across sessions but is specific to this browser.

**💡 Tip**: After saving, your ncAA is now available for selection in STM and MTS workflows.

---

## Potential modifications

### Overview

**What are Potential modifications?**

Potential modifications represent chemical changes that **may or may not occur** in your experimental samples. Unlike standard parameters, these modifications are probabilistic - the system calculates results for all possible combinations.

**When to use**: When you want to model scenarios where:
- Post-translational modifications might occur
- N-terminus or C-terminus modifications are possible
- Crosslinking events may happen
- You're not certain which modifications are present

### Types of Modifications

#### Single-Site Modifications

Modifications that occur at a single amino acid position.

##### 1. N-terminus (N-terminal modification)

- **Effect**: Adds a chemical group to the *first* amino acid (N-terminus)
- **Example**: Formylation (fMet), acetylation, biotinylation
- **Notation**: Modification appears before amino acid (e.g., `fM` for formyl-methionine)

**Common biological scenarios**:
- Bacterial proteins often have formylated methionine (fMet) at N-terminus
- Eukaryotic proteins may have acetylated N-terminus
- Signal peptides may have modified N-terminus

**How to configure**:
1. Select "Single-site modification"
2. Choose "N-terminus" condition
3. Draw the modifying group (e.g., formyl group: HC=O)
4. Target is automatically set to "First amino acid"
5. Set any additional conditions (e.g., "only if Met is first")

##### 2. C-terminus (C-terminal modification)

- **Effect**: Adds a chemical group to the *last* amino acid (C-terminus)
- **Example**: Amidation (-NH₂), methylation
- **Notation**: Modification appears after amino acid

**Common biological scenarios**:
- Peptide hormones often have amidated C-terminus
- Some proteolytic processing leaves modified C-terminus

##### 3. Side Chain (Side chain modification)

- **Effect**: Modifies the side chain of specific amino acid(s) anywhere in the sequence
- **Example**: Phosphorylation (S/T/Y), methylation (K/R), acetylation (K)
- **Notation**: Modification appears on specific amino acids

**Common biological scenarios**:
- Phosphorylation on Ser/Thr/Tyr for signaling
- Methylation on Lys/Arg for epigenetic regulation
- Acetylation on Lys for gene regulation
- Ubiquitination on Lys for protein degradation

**How to configure**:
1. Select "Single-site modification"
2. Choose "Side Chain" condition
3. Draw the modifying group (e.g., phosphate group: OPO₃H₂)
4. Select target amino acid(s) - can select multiple or "ALL"
5. Set conditions (e.g., "only at specific positions")

#### Crosslinking Modifications

Modifications that create a covalent bond between two amino acids.

- **Effect**: Links two amino acids together, typically with mass change
- **Example**: Disulfide bond (C-C with -2.02 Da), cross-linkers
- **Notation**: Both amino acids marked in sequence

**Common biological scenarios**:
- Disulfide bonds between Cys residues for protein stability
- Enzymatic crosslinking (e.g., transglutaminase links K and Q)
- Chemical crosslinkers for protein structure studies

**How to configure**:
1. Select "Crosslinking modification"
2. Choose condition ("All to All" or "Sequential")
3. Draw the linking structure
4. Select Target 1 amino acid (e.g., Cys)
5. Select Target 2 amino acid (e.g., Cys)
6. Set minimum distance between targets if needed

**Condition options**:
- **All to All**: Any two target amino acids can crosslink (regardless of position)
- **Sequential**: Only adjacent or nearby amino acids can crosslink

### Power Set Combination Logic

**Key concept**: When you select multiple potential modifications (up to 4 for N-terminus and C-terminus each), the system generates **ALL possible combinations** automatically.

This means the calculation considers:
- 0 modifications applied (base sequence)
- Only 1 modification applied (each one separately)
- Only 2 modifications applied (all pairs)
- Only 3 modifications applied (all triplets)
- All modifications applied

**Mathematical basis**: For N modifications selected, the system generates 2^N combinations (Power Set).

#### Examples

**Scenario 1: Two N-terminus modifications selected (f1, f2)**

Generated results:
- 0 modifications applied
- Only f1 applied
- Only f2 applied
- Both f1 and f2 applied

Total: **4 combinations** (2²)

---

**Scenario 2: Two N-terminus (n1, n2) + Three C-terminus (c1, c2, c3) modifications**

N-terminus combinations:
- []
- [n1]
- [n2]
- [n1, n2]

C-terminus combinations:
- []
- [c1]
- [c2]
- [c3]
- [c1, c2]
- [c1, c3]
- [c2, c3]
- [c1, c2, c3]

Total: **4 × 8 = 32 combinations** (2² × 2³)

---

**Scenario 3: Four N-terminus modifications selected**

This generates 2⁴ = **16 combinations**:
- 0 applied: [] (1 combination)
- 1 applied: 4 combinations
- 2 applied: 6 combinations
- 3 applied: 4 combinations
- 4 applied: 1 combination

---

**Why this matters for research**:

In real experiments, you often don't know which modifications actually occurred. By generating all combinations, X-MAS helps you:
1. **Match experimental peaks**: Compare your MS data against all possibilities
2. **Identify modification states**: Determine which modifications are present based on which masses you observe
3. **Complete coverage**: Ensure you don't miss any potential modification patterns

### Load template Feature

**What it does**: Quickly load pre-drawn modification structures from a template library.

**Available templates**:
- **Formyl group** (N-terminus): -CHO for formylation
- **Acetyl group** (N-terminus): -COCH₃ for acetylation
- **Phosphate group** (Side chain): -PO₃H₂ for phosphorylation
- **Methyl group** (Side chain): -CH₃ for methylation
- **Disulfide bond** (Crosslinking): S-S bond between cysteines
- And more...

**How to use**:
1. Click "Load template" button in the modification editor
2. Browse the template gallery
3. Click on a template to load its structure
4. Modify as needed or use as-is
5. Proceed with configuration

**💡 Tip**: Templates are a great starting point. You can load a template and then modify it for your specific needs.

---

## Tips & Best Practices

### General Workflow

1. **Start with known sequences**: Use STM first to predict what you *should* see, then use MTS to verify what you *actually* see
2. **Build incrementally**: Start with standard amino acids, then add ncAAs and modifications one at a time
3. **Document your configurations**: Keep notes on which ncAAs and modifications you configured for each experiment
4. **Validate with controls**: Run calculations on known sequences to verify your setup is correct

### Data Management

**⚠️ Important**: All data (ncAAs, modifications, configurations) is stored in your browser's local storage. This means:
- Data persists between sessions
- Data is specific to this browser on this computer
- Clearing browser data will delete your saved items
- Data is not synced across devices

**Best practices**:
- **Export important structures**: Save MOL files for critical ncAA structures as backups
- **Document configurations**: Keep external notes on modification setups
- **Use consistent naming**: Makes it easier to find saved items later

### Troubleshooting Common Issues

**Problem**: No results returned from MTS calculation

**Possible causes**:
- Mass values too high for sequence length constraints
- Too many ncAAs selected (over-constraining the search)
- Algorithm mode too low for the complexity

**Solutions**:
- Try increasing result count
- Switch to "Deep Think" or "Ultra Think" mode
- Verify your input masses are correct
- Check that your ncAA definitions are accurate

---

**Problem**: STM generates too many results

**Possible causes**:
- Multiple translation phenomena selected
- Many ncAAs with low incorporation rates
- Multiple potential modifications

**Solutions**:
- Filter results by mass range
- Disable unnecessary translation phenomena
- Set ncAA incorporation rates to 100% if you know they're always incorporated
- Review which potential modifications are truly relevant

---

**Problem**: Masses don't match between STM predictions and MTS results

**Possible causes**:
- Different ion adducts selected
- Potential modifications not configured identically
- ncAA structures have different masses

**Solutions**:
- Verify ion adduct selections match
- Double-check ncAA structures and masses
- Ensure modification configurations are identical
- Check for mass measurement errors in MS data

---

**Problem**: ChemDoodle structure won't calculate weight

**Possible causes**:
- Structure is not chemically valid
- Disconnected fragments in the drawing
- Missing or incorrect atom types

**Solutions**:
- Verify all atoms are connected
- Check for unusual valences or bonding
- Try loading a template and modifying it instead
- Clear the canvas and redraw

---

### Performance Tips

**For faster calculations**:
- Always provide RNA sequence in MTS when available
- Use "Think" mode first, upgrade to "Deep Think" only if needed
- Limit the number of ncAAs to only those actually used
- Set realistic sequence length constraints
- Reduce result count if you only need top matches

**For more accurate results**:
- Use "Ultra Think" mode for critical analyses
- Increase result count to see more possibilities
- Provide all relevant modifications and phenomena
- Double-check all structure drawings and masses
- Validate against known control sequences

---

## Additional Resources

### Getting Help

- **In-app documentation**: Hover tooltips and help text throughout the interface
- **Technical documentation**: See STM.md, MTS.md, POTENTIAL_MODIFICATION_SPEC.md for algorithm details
- **Contact**: [Your support contact information]

### Citing X-MAS

[Include citation information if applicable]

### Version Information

This manual corresponds to X-MAS version [version number].
Last updated: [date]

---

**End of Manual**
