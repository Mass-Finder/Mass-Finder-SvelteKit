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

export interface MoleculeJson {
    atoms: Atom[];
    bonds: Bond[];
    rings: any[];
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

    /// fomular 계산 함수
    getMolecularFormula(): string {
        const elementCount: { [key: string]: number } = {};
        const hydrogenCount: { [key: string]: number } = {};

        /// ## 1. 원소 개수 세기
        this.atoms.forEach(atom => {
            // Map에 각 원소가 이미 있으면 value 에 1을 더해주고 없으면 새로 추가 후 value를 1로 셋팅
            if (elementCount[atom.label]) {
                elementCount[atom.label]++;
            } else {
                elementCount[atom.label] = 1;
            }
        });

        // /// ## 2. 수소 원자 개수 계산
        // this.atoms.forEach(atom => {
        //     // 각 원소별 최대 결합의 수
        //     const valence = this.valenceElectrons[atom.label] || 0;
        //     // 해당 원자에 연결된 진짜 결합의 수
        //     const bonds = this.bonds.filter(bond => bond.a1.pid === atom.pid || bond.a2.pid === atom.pid);
        //     // 최대 결합수 - 진짜 겹합수 해서 필요한 수소의 갯수 가져옴
        //     const hydrogenNeeded = valence - bonds.length;
        //     if (hydrogenNeeded > 0) {
        //         hydrogenCount['H'] = (hydrogenCount['H'] || 0) + hydrogenNeeded;
        //     }
        // });

        this.atoms.forEach(atom => {
            const valence = this.valenceElectrons[atom.label] || 0;
            const bonds = this.bonds.filter(bond => bond.a1.pid === atom.pid || bond.a2.pid === atom.pid);
            const totalBondOrder = bonds.reduce((sum, bond) => sum + bond.bondOrder, 0);
            const hydrogenNeeded = valence - totalBondOrder;
            if (hydrogenNeeded > 0) {
                hydrogenCount['H'] = (hydrogenCount['H'] || 0) + hydrogenNeeded;
            }
        });

        // 위에서 더 필요한 수소가 있다고 판된됐을때 총 수소의 수에 더해줌
        if (hydrogenCount['H']) {
            elementCount['H'] = (elementCount['H'] || 0) + hydrogenCount['H'];
        }

        /// ## 3. 화학식 생성
        // 각 요소를 순회하면서 갯수를 도출하여 join
        return Object.keys(elementCount).map(element => {
            const count = elementCount[element];
            return count > 1 ? `${element}${count}` : element;
        }).join('');
    }

    /// 분자량 계산 함수
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