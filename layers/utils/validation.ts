import Electron from 'electron';
import {isObjectLike} from "lodash";

export type Condition = {
    field: string;
    validate: (value: any) => boolean;
}

export const validationArgumentsInvoke = (conditions: Condition[]) => {
    return (callback: (event: Electron.IpcMainInvokeEvent, arg: any) => any) => {
       return (event: Electron.IpcMainInvokeEvent, arg: any) => {
           try {
               if (conditions.length > 1 && isObjectLike(arg)) {
                   for (let condition of conditions) {
                       if (!condition.validate(arg[condition.field])) {
                           console.log(`Invalid argument: ${condition.field}`);
                           return {error: `Invalid argument: ${condition.field}`};
                       }
                   }
               } else if (conditions.length === 1 && !isObjectLike(arg)) {
                  if (!conditions[0].validate(arg)) {
                      console.log(`Invalid argument: ${conditions[0].field}`);
                      return {error: `Invalid argument: ${conditions[0].field}`};
                  }
               }
               return callback(event, arg);
           } catch (e: any) {
               return {error: e.message};
           }
       }
    }
}

export const validateStringArg = validationArgumentsInvoke([
    {
        field: 'string',
        validate: (arg: unknown) => {
            // Check if the argument is a string
            return (arg !== undefined && arg !== null && typeof arg !== 'string');
        },
    },
])

export const validateObjectArg = validationArgumentsInvoke([
    {
        field: 'string',
        validate: (arg: unknown) => {
            // Check if the argument is a string
            return (arg !== undefined && arg !== null && typeof arg === 'string');
        },
    },
])