export interface Atom {
    label: string;
    x: number;
    y: number;
    z: number;
    enhancedStereo?: {
        type: string;
        group: number;
    };
    pid: number;
}

export interface Bond {
    a1: Atom;
    a2: Atom;
    bondOrder: number;
    pid: number;
}

export interface Ring {
    atoms: Atom[];
}

export interface MoleculeJson {
    atoms: Atom[];
    bonds: Bond[];
    rings: Ring[];
}

export class Molecule {
    private atoms: Atom[] = [];
    private bonds: Bond[] = [];
    private pidCounter: number = 0;

    // 각 원소의 결합 수를 정의하는 테이블
    private valenceElectrons: { [key: string]: number } = {
        'H': 1, 'He': 0, 'Li': 1, 'Be': 2, 'B': 3, 'C': 4, 'N': 3, 'O': 2, 'F': 1, 'Ne': 0,
        'Na': 1, 'Mg': 2, 'Al': 3, 'Si': 4, 'P': 3, 'S': 2, 'Cl': 1, 'Ar': 0,
        'K': 1, 'Ca': 2, 'Sc': 3, 'Ti': 4, 'V': 5, 'Cr': 6, 'Mn': 7, 'Fe': 6, 'Co': 5, 'Ni': 4, 'Cu': 3, 'Zn': 2,
        'Ga': 3, 'Ge': 4, 'As': 5, 'Se': 6, 'Br': 1, 'Kr': 0, 'Rb': 1, 'Sr': 2, 'Y': 3, 'Zr': 4,
        'Nb': 5, 'Mo': 6, 'Tc': 7, 'Ru': 6, 'Rh': 5, 'Pd': 4, 'Ag': 3, 'Cd': 2, 'In': 3, 'Sn': 4,
        'Sb': 5, 'Te': 6, 'I': 1, 'Xe': 0, 'Cs': 1, 'Ba': 2, 'La': 3, 'Ce': 4, 'Pr': 5, 'Nd': 6,
        'Pm': 7, 'Sm': 6, 'Eu': 5, 'Gd': 4, 'Tb': 3, 'Dy': 2, 'Ho': 1, 'Er': 0, 'Tm': 1, 'Yb': 2, 'Lu': 3,
        'Hf': 4, 'Ta': 5, 'W': 6, 'Re': 7, 'Os': 6, 'Ir': 5, 'Pt': 4, 'Au': 3, 'Hg': 2, 'Tl': 1, 'Pb': 2,
        'Bi': 3, 'Po': 4, 'At': 5, 'Rn': 6, 'Fr': 7, 'Ra': 6, 'Ac': 5, 'Th': 4, 'Pa': 3, 'U': 2
    };

    // 각 분자별 무게 (mocular mass 아니고 monoisotopic mass)
    private monoisotopicMasses: { [key: string]: number } = {
        'H': 1.007825, 'He': 4.002603, 'Li': 7.016004, 'Be': 9.012182, 'B': 11.009305, 'C': 12.0, 'N': 14.003074, 'O': 15.994915, 'F': 18.998403, 'Ne': 19.99244,
        'Na': 22.98977, 'Mg': 23.985042, 'Al': 26.981538, 'Si': 27.976927, 'P': 30.973762, 'S': 31.972071, 'Cl': 34.968853, 'Ar': 39.962383,
        'K': 38.963707, 'Ca': 39.962591, 'Sc': 44.955908, 'Ti': 47.947947, 'V': 50.943964, 'Cr': 51.940506, 'Mn': 54.938046, 'Fe': 55.934939, 'Co': 58.933198, 'Ni': 57.935347, 'Cu': 62.929601, 'Zn': 63.929147,
        'Ga': 68.925581, 'Ge': 73.921178, 'As': 74.921596, 'Se': 79.916522, 'Br': 78.918338, 'Kr': 83.911507, 'Rb': 84.911789, 'Sr': 87.905614, 'Y': 88.905849, 'Zr': 89.904704,
        'Nb': 92.906378, 'Mo': 97.905408, 'Tc': 98.0, 'Ru': 101.90434, 'Rh': 102.9055, 'Pd': 105.903483, 'Ag': 106.905093, 'Cd': 113.903358, 'In': 114.903878, 'Sn': 119.902196,
        'Sb': 120.903815, 'Te': 129.906223, 'I': 126.904468, 'Xe': 131.904154, 'Cs': 132.905451, 'Ba': 137.905247, 'La': 138.906353, 'Ce': 139.905439, 'Pr': 140.907647, 'Nd': 141.907723,
        'Pm': 145.0, 'Sm': 151.919728, 'Eu': 152.921226, 'Gd': 157.924019, 'Tb': 158.925352, 'Dy': 163.929174, 'Ho': 164.930319, 'Er': 165.93029, 'Tm': 168.934212, 'Yb': 173.938873, 'Lu': 174.940786,
        'Hf': 179.946561, 'Ta': 180.947992, 'W': 183.950931, 'Re': 186.955753, 'Os': 191.961479, 'Ir': 192.962924, 'Pt': 194.964791, 'Au': 196.966552, 'Hg': 201.970626, 'Tl': 204.974412, 'Pb': 207.976641,
        'Bi': 208.980383, 'Po': 209.0, 'At': 210.0, 'Rn': 222.0, 'Fr': 223.0, 'Ra': 226.0, 'Ac': 227.0, 'Th': 232.0377, 'Pa': 231.03588, 'U': 238.05078
    };

    // 각 분자별 무게 (molecular mass)
    private molecularMasses: { [key: string]: number } = {
        'H': 1.008, 'He': 4.002602, 'Li': 6.94, 'Be': 9.0121831, 'B': 10.81, 'C': 12.011, 'N': 14.007, 'O': 15.999, 'F': 18.998403163, 'Ne': 20.1797,
        'Na': 22.98976928, 'Mg': 24.305, 'Al': 26.9815385, 'Si': 28.085, 'P': 30.973761998, 'S': 32.06, 'Cl': 35.45, 'Ar': 39.948,
        'K': 39.0983, 'Ca': 40.078, 'Sc': 44.955908, 'Ti': 47.867, 'V': 50.9415, 'Cr': 51.9961, 'Mn': 54.938044, 'Fe': 55.845, 'Co': 58.933194, 'Ni': 58.6934, 'Cu': 63.546, 'Zn': 65.38,
        'Ga': 69.723, 'Ge': 72.63, 'As': 74.921595, 'Se': 78.971, 'Br': 79.904, 'Kr': 83.798, 'Rb': 85.4678, 'Sr': 87.62, 'Y': 88.90584, 'Zr': 91.224,
        'Nb': 92.90637, 'Mo': 95.95, 'Tc': 98.0, 'Ru': 101.07, 'Rh': 102.90550, 'Pd': 106.42, 'Ag': 107.8682, 'Cd': 112.414, 'In': 114.818, 'Sn': 118.71,
        'Sb': 121.76, 'Te': 127.6, 'I': 126.90447, 'Xe': 131.293, 'Cs': 132.90545196, 'Ba': 137.327, 'La': 138.90547, 'Ce': 140.116, 'Pr': 140.90766, 'Nd': 144.242,
        'Pm': 145.0, 'Sm': 150.36, 'Eu': 151.964, 'Gd': 157.25, 'Tb': 158.92535, 'Dy': 162.5, 'Ho': 164.93033, 'Er': 167.259, 'Tm': 168.93422, 'Yb': 173.045, 'Lu': 174.9668,
        'Hf': 178.49, 'Ta': 180.94788, 'W': 183.84, 'Re': 186.207, 'Os': 190.23, 'Ir': 192.217, 'Pt': 195.084, 'Au': 196.966569, 'Hg': 200.592, 'Tl': 204.38, 'Pb': 207.2,
        'Bi': 208.98040, 'Po': 209.0, 'At': 210.0, 'Rn': 222.0, 'Fr': 223.0, 'Ra': 226.0, 'Ac': 227.0, 'Th': 232.0377, 'Pa': 231.03588, 'U': 238.02891
    };

    addAtom(label: string, x: number, y: number, z: number, stereoType?: string, stereoGroup?: number): Atom {
        const atom: Atom = {
            label,
            x,
            y,
            z,
            enhancedStereo: stereoType ? { type: stereoType, group: stereoGroup || 1 } : undefined,
            pid: this.pidCounter++
        };
        this.atoms.push(atom);
        return atom;
    }

    addBond(a1: Atom, a2: Atom, bondOrder: number): void {
        const bond: Bond = {
            a1,
            a2,
            bondOrder,
            pid: this.pidCounter++
        };
        this.bonds.push(bond);
    }

    getMoleculeJson(): MoleculeJson {
        return {
            atoms: this.atoms,
            bonds: this.bonds,
            rings: []
        };
    }

    getMolecularFormula(): string {
        const elementCounts = new Map<string, number>();
    
        // 모든 원자를 먼저 카운트
        this.atoms.forEach(atom => {
            const symbol = atom.label;
            elementCounts.set(symbol, (elementCounts.get(symbol) || 0) + 1);
        });
    
        // 암시적 수소(H) 원자 수 계산 수정
        let totalH = 0;
        this.atoms.forEach(atom => {
            if (atom.label !== 'H') {  // 명시적 H는 이미 카운트됨
                // 해당 원자와 연결된 모든 결합을 찾고, bondOrder의 합을 구함
                const bonds = this.bonds.filter(bond =>
                    bond.a1.pid === atom.pid || bond.a2.pid === atom.pid
                );
                const bondOrderSum = bonds.reduce((sum, bond) => sum + bond.bondOrder, 0);
    
                // 원자가(valence)에서 실제 결합 수(여기서는 bondOrder의 합)를 뺀 값이 암시적 수소 수
                const implicitH = this.getImplicitHydrogens(atom, bondOrderSum);
                totalH += implicitH;
            }
        });
    
        // 명시적 수소 + 암시적 수소
        if (totalH > 0) {
            elementCounts.set('H', (elementCounts.get('H') || 0) + totalH);
        }
    
        // 분자식 생성: C, H 순서로 출력하고, 나머지는 알파벳 순으로
        let formula = '';
        const cCount = elementCounts.get('C');
        if (cCount) {
            formula += 'C' + (cCount > 1 ? cCount : '');
            elementCounts.delete('C');
        }
        const hCount = elementCounts.get('H');
        if (hCount) {
            formula += 'H' + (hCount > 1 ? hCount : '');
            elementCounts.delete('H');
        }
        Array.from(elementCounts.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([element, count]) => {
                formula += element + (count > 1 ? count : '');
            });
    
        return formula;
    }

    // 원자의 암시적 수소 수를 계산하는 헬퍼 메서드
    private getImplicitHydrogens(atom: Atom, bondCount: number): number {
        const valenceMap: { [key: string]: number } = {
            'C': 4,  // 탄소
            'N': 3,  // 질소
            'O': 2,  // 산소
            'S': 2,  // 황
            'Se': 2, // 셀레늄
            'P': 3,  // 인
            'H': 1,  // 수소
            'F': 1,  // 플루오린
            'Cl': 1, // 염소
            'Br': 1, // 브로민
            'I': 1,  // 아이오딘
            'B': 3,  // 붕소
            'Si': 4, // 규소
            'Ge': 4, // 저마늄
            'As': 3, // 비소
            'Te': 2, // 텔루륨
            'At': 1, // 아스타틴
            'He': 0, // 헬륨
            'Ne': 0, // 네온
            'Ar': 0, // 아르곤
            'Kr': 0, // 크립톤
            'Xe': 0, // 제논
            'Rn': 0, // 라돈
        };

        const valence = valenceMap[atom.label] || 0;
        if (valence === 0) return 0;

        // 실제 결합 수를 원자가에서 빼서 암시적 수소 수 계산
        const implicitH = valence - bondCount;
        return implicitH > 0 ? implicitH : 0;
    }

    /// 분자량 계산 함수 (monoisotopic mass)
    getMonoisotopicMass(): number {
        const formula = this.getMolecularFormula();
        const elementPattern = /([A-Z][a-z]*)(\d*)/g;
        let match;
        let monoisotopicMass = 0;

        while ((match = elementPattern.exec(formula)) !== null) {
            const element = match[1];
            const count = parseInt(match[2] || '1', 10);
            const monoisotopicMassOfElement = this.monoisotopicMasses[element] || 0;
            monoisotopicMass += monoisotopicMassOfElement * count;
        }

        return monoisotopicMass;
    }

    /// 분자량 계산 함수 (molecular mass)
    getMolecularMass(): number {
        const formula = this.getMolecularFormula();
        const elementPattern = /([A-Z][a-z]*)(\d*)/g;
        let match;
        let molecularMass = 0;

        while ((match = elementPattern.exec(formula)) !== null) {
            const element = match[1];
            const count = parseInt(match[2] || '1', 10);
            const molecularMassOfElement = this.molecularMasses[element] || 0;
            molecularMass += molecularMassOfElement * count;
        }

        return molecularMass;
    }


    static fromJson(jsonString: string): Molecule {
        const moleculeData: MoleculeJson = JSON.parse(jsonString);
        const molecule = new Molecule();

        const atomsMap: { [pid: number]: Atom } = {};

        moleculeData.atoms.forEach(atomData => {
            const atom = molecule.addAtom(
                atomData.label,
                atomData.x,
                atomData.y,
                atomData.z,
                atomData.enhancedStereo?.type,
                atomData.enhancedStereo?.group
            );
            atom.pid = atomData.pid; // Ensure we match the original pids
            atomsMap[atomData.pid] = atom;
        });

        moleculeData.bonds.forEach(bondData => {
            const a1 = atomsMap[bondData.a1.pid];
            const a2 = atomsMap[bondData.a2.pid];
            molecule.addBond(a1, a2, bondData.bondOrder);
        });

        return molecule;
    }
}