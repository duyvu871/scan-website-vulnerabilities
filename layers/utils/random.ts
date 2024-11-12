import { random } from 'lodash';

export const randomByRange = (min: number, max: number) => {
    return random(min, max);
}