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
        loadMolecule(molecule: Molecule): void;
        clear(): void;
        repaint(): void;
        styles: Styles;
    }

    // MOL 파일 읽기 함수
    function readMOL(molString: string): Molecule;

    // ELEMENT 객체 타입 정의
    interface ElementType {
        jmolColor: string;
    }

    const ELEMENT: {
        H: ElementType;
        S: ElementType;
        [key: string]: ElementType;
    };

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
