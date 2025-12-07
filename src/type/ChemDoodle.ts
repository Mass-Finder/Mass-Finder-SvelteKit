// ChemDoodle type definitions
// Note: ChemDoodle is an external library, so some types are kept as 'unknown' for flexibility

declare namespace ChemDoodle {
    // Molecule structure (simplified)
    interface Molecule {
        atoms: unknown[];
        bonds: unknown[];
        [key: string]: unknown;
    }

    // Canvas options
    interface CanvasOptions {
        [key: string]: unknown;
    }

    // Calculation options
    interface CalculationOptions {
        [key: string]: unknown;
    }

    // Calculation result
    interface CalculationResult {
        [key: string]: unknown;
    }

    // Styles object
    interface Styles {
        [key: string]: unknown;
    }

    class SketcherCanvas {
        constructor(id: string, width: number, height: number, options: CanvasOptions);
        getMolecule(): Molecule;
        repaint(): void;
        styles: Styles;
    }

    namespace ELEMENT {
        let H: { jmolColor: string };
        let S: { jmolColor: string };
    }

    namespace iChemLabs {
        function calculate(
            molecule: Molecule,
            options: CalculationOptions,
            callback: (content: CalculationResult) => void
        ): unknown;
    }

    namespace lib {
        // jQuery is external, keep as unknown
        let jQuery: unknown;
    }

    class ViewerCanvas {
        constructor(id: string, width: number, height: number);
        loadMolecule(data: Molecule | string): unknown;
        repaint(): void;
        styles: Styles;
    }

    namespace io {
        class JSONInterpreter {
            molTo(molecule: Molecule): string;
            molFrom(json: string): Molecule;
        }
    }
}
