import {Model, DataType, Sequelize, AbstractDialect, DataTypes} from '@sequelize/core';
import {  } from '@sequelize/sqlite3';

type JsonFieldOptions<T> = {
    type?: typeof DataTypes.TEXT;
    defaultValue?: T;
};

const JsonField = <
    TModel extends Model,
    TField extends keyof TModel['dataValues']
>(
    refModel: TModel,
    modelName: string,
    fieldName: TField,
    options: JsonFieldOptions<TModel['dataValues'][TField]> = {}
) => {
    const model: any = {
        type: options.type || DataTypes.TEXT,
        get() {
            const currentValue = this.getDataValue(fieldName);
            if (typeof currentValue === 'string') {
                try {
                    // @ts-ignore
                    this.setDataValue(fieldName, JSON.parse(currentValue));
                } catch (error) {
                    console.error(`Lỗi khi parse JSON cho trường ${fieldName.toString()}:`, error);
                    // Xử lý lỗi ở đây, ví dụ:
                    // this.setDataValue(fieldName, null);
                }
            }
            return this.getDataValue(fieldName);
        },
        set(value: any) {
            this.setDataValue(fieldName, value ? JSON.stringify(value) : null);
        },
    };

    if (options.hasOwnProperty('defaultValue')) {
        model.defaultValue = options.defaultValue ? JSON.stringify(options.defaultValue) : null;
    }

    if (refModel.sequelize) {
        refModel.sequelize.addHook('beforeUpdate', (instance: TModel) => {
            const value = instance.getDataValue(fieldName);
            if (typeof value !== 'string' && value !== null) {
                instance.setDataValue(fieldName, JSON.stringify(value));
            }
        });

        refModel.sequelize.addHook('beforeCreate', (instance: TModel) => {
            const value = instance.getDataValue(fieldName);
            if (typeof value !== 'string' && value !== null) {
                instance.setDataValue(fieldName, JSON.stringify(value));
            }
        });
    } else {
        console.warn(`Model ${modelName} chưa được định nghĩa. Hook sẽ không được thêm.`);
    }

    return model;
};

export default JsonField;