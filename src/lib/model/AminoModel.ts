import type { IonType, FormyType, JsonObject } from '../../type/Types';

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
    matchedCount?: number;
    totalCount?: number;

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
        this.matchedCount = data.matchedCount;
        this.totalCount = data.totalCount;
    }

    static fromJson(json: JsonObject): AminoModel {
        return new AminoModel({
            code: json['code'] as string | undefined,
            totalWeight: json['totalWeight'] as number | undefined,
            waterWeight: json['waterWeight'] as number | undefined,
            weight: json['weight'] as number | undefined,
            molecularWeight: json['molecularWeight'] as number | undefined,
            formyType: json['formyType'] as FormyType | undefined,
            ionType: json['ionType'] as IonType | undefined,
            essentialSeq: json['essentialSeq'] as string | undefined,
            similarity: json['similarity'] as number | undefined,
            sequenceSimilarity: json['sequenceSimilarity'] as number | undefined,
            matchedCount: json['matchedCount'] as number | undefined,
            totalCount: json['totalCount'] as number | undefined
        });
    }

    toJson(): JsonObject {
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
            sequenceSimilarity: this.sequenceSimilarity,
            matchedCount: this.matchedCount,
            totalCount: this.totalCount
        };
    }
}
