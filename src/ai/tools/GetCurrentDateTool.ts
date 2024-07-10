import {BaseToolWithCall, FunctionTool, JSONValue} from 'llamaindex';
import { JSONSchemaType } from 'ajv';

const getCurrentDate = async (): Promise<JSONValue> => {
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Sao_Paulo'
    };
    return currentDate.toLocaleString('pt-BR', options);
};

const emptySchema: JSONSchemaType<{}> = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

export const getCurrentDateTool = FunctionTool.from(getCurrentDate, {
        name: 'getCurrentDate',
        description: 'get current date and time in Brazilian format DAY/MONTH/YEAR',
        parameters: emptySchema
    });