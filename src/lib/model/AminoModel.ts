import type { IonType, FormyType } from '../../type/Types';

export class AminoModel {
    code?: string;
    totalWeight?: number;
    waterWeight?: number;
    weight?: number;
    molecularWeight?: number;
    formyType?: FormyType;
    ionType?: IonType;
    essentialSeq?: string;
    similarity?: number;
    sequenceSimilarity?: number;

    constructor(data: Partial<AminoModel> = {}) {
        this.code = data.code;
        this.totalWeight = data.totalWeight;
        this.waterWeight = data.waterWeight;
        this.weight = data.weight;
        this.molecularWeight = data.molecularWeight;
        this.formyType = data.formyType;
        this.ionType = data.ionType;
        this.essentialSeq = data.essentialSeq;
        this.similarity = data.similarity;
        this.sequenceSimilarity = data.sequenceSimilarity;
    }

    static fromJson(json: { [key: string]: any }): AminoModel {
        return new AminoModel({
            code: json['code'],
            totalWeight: json['totalWeight'],
            waterWeight: json['waterWeight'],
            weight: json['weight'],
            molecularWeight: json['molecularWeight'],
            formyType: json['formyType'] as FormyType,
            ionType: json['ionType'] as IonType,
            essentialSeq: json['essentialSeq'],
            similarity: json['similarity'],
            sequenceSimilarity: json['sequenceSimilarity']
        });
    }

    toJson(): { [key: string]: any } {
        return {
            code: this.code,
            totalWeight: this.totalWeight,
            waterWeight: this.waterWeight,
            weight: this.weight,
            molecularWeight: this.molecularWeight,
            formyType: this.formyType,
            ionType: this.ionType,
            essentialSeq: this.essentialSeq,
            similarity: this.similarity,
            sequenceSimilarity: this.sequenceSimilarity
        };
    }
}
