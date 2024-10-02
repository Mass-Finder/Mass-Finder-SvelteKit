declare namespace ChemDoodle {
    // Add relevant types and interfaces here
    class SketcherCanvas {
        constructor(id: string, width: number, height: number, options: any);
        getMolecule(): any;
        repaint(): void;
        styles: any;
    }

    namespace ELEMENT {
        let H: { jmolColor: string };
        let S: { jmolColor: string };
    }

    namespace iChemLabs {
        function calculate(molecule: any, options: any, callback: (content: any) => void): any;
    }

    namespace lib {
        let jQuery: any;
    }

    class ViewerCanvas {
        constructor(id: string, width: number, height: number);
        loadMolecule(data : any): any;
        repaint(): void;
        styles: any;
    }

    // 추가된 io 네임스페이스
    namespace io {
        class JSONInterpreter {
            molTo(molecule: any): string; 
            molFrom(json: string): any;
        }
    }
}
