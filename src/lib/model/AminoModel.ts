import type { IonType, FormyType } from '../../type/Types';

export class AminoModel {
    code?: string;
    totalWeight?: number;
    waterWeight?: number;
    weight?: number;
    formyType?: FormyType;
    ionType?: IonType;
    essentialSeq?: string;
    similarity?: number;

    constructor(data: Partial<AminoModel> = {}) {
        this.code = data.code;
        this.totalWeight = data.totalWeight;
        this.waterWeight = data.waterWeight;
        this.weight = data.weight;
        this.formyType = data.formyType;
        this.ionType = data.ionType;
        this.essentialSeq = data.essentialSeq;
        this.similarity = data.similarity;
    }

    static fromJson(json: { [key: string]: any }): AminoModel {
        return new AminoModel({
            code: json['code'],
            totalWeight: json['totalWeight'],
            waterWeight: json['waterWeight'],
            weight: json['weight'],
            formyType: json['formyType'] as FormyType,
            ionType: json['ionType'] as IonType,
            essentialSeq: json['essentialSeq'],
            similarity: json['similarity']
        });
    }

    toJson(): { [key: string]: any } {
        return {
            code: this.code,
            totalWeight: this.totalWeight,
            waterWeight: this.waterWeight,
            weight: this.weight,
            formyType: this.formyType,
            ionType: this.ionType,
            essentialSeq: this.essentialSeq,
            similarity: this.similarity
        };
    }
}
