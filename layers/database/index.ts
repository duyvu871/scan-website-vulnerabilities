import { Sequelize, DataTypes, Model } from '@sequelize/core';
import { SqliteDialect } from '@sequelize/sqlite3';
// import path from "path";
// import {isDev} from "../utils/env";
import databasePath from "../utils/databasePath";

export const sequelize = new Sequelize({
    dialect: SqliteDialect,
    storage: databasePath,
    logging: false,
    retry: {
        match: [
            /SQLITE_BUSY/,
        ],
        name: 'query',
        backoffBase: 100,
        backoffExponent: 1.5,
        timeout: 60000,
        max: 5
    },
});

interface HeadersScanAttributes {
    clientId: string | null;
    url: string;
    ips: { ip: string[] | null; family: string }[] | null;
    geo: Partial<{
        country: string;
        city: string;
        region1: string;
        region1_name: string;
        region2: string;
        region2_name: string;
        timezone: string;
        latitude: number;
        longitude: number;
        eu: number;
        area: number;
    }> | null;
    asn: Partial<{
        as_domain: string;
        as_name: string;
        asn: string;
        continent: string;
        continent_name: string;
        country: string;
        country_name: string;
    }> | null;
    status: string | null;
    timestamp: number | null;
    technology: string | null;
    headers: string | null;
    nmap: string | null;
    headerChecks: string | null;
    screenshot: string | null;
    dirBuster: string | null;
}

export type HeadersScanCreationAttributes = Omit<
    HeadersScanAttributes,
    'createdAt' | 'updatedAt'
>;

export class HeadersScan
    extends Model<HeadersScanAttributes, HeadersScanCreationAttributes>
    implements HeadersScanAttributes
{
    public clientId!: HeadersScanAttributes['clientId'];
    public url!: HeadersScanAttributes['url'];
    public ips!: HeadersScanAttributes['ips'];
    public geo!: HeadersScanAttributes['geo'];
    public asn!: HeadersScanAttributes['asn'];
    public status!: HeadersScanAttributes['status'];
    public timestamp!: HeadersScanAttributes['timestamp'];
    public technology!: HeadersScanAttributes['technology'];
    public headers!: HeadersScanAttributes['headers'];
    public nmap!: HeadersScanAttributes['nmap'];
    public headerChecks!: HeadersScanAttributes['headerChecks'];
    public screenshot!: HeadersScanAttributes['screenshot'];
    public dirBuster!: HeadersScanAttributes['dirBuster'];

    // timestamps!
    public readonly createdAt!: Date | null;
    public readonly updatedAt!: Date | null;

    static associate(models: any) {}
}

HeadersScan.init(
    {
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ips: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        geo: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        asn: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        technology: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        headers: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nmap: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        headerChecks: DataTypes.JSON,
        screenshot: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dirBuster: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'HeadersScan',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

HeadersScan.addHook('beforeCreate', (instance: HeadersScan) => {
    const emptyValueFound = Object.entries(instance.dataValues).filter(
        ([, value]) => value === null || value === undefined
    ) as [keyof HeadersScanAttributes, any][];

    if (emptyValueFound.length > 0) {
        // fill null to empty fields
        emptyValueFound.forEach(([key, value]) => {
            instance.setDataValue(key, null);
        });
    }
});

(async () => {
    try {
        await HeadersScan.sync({
            // ...(isDev ? {force: true} : {}),
            alter: true, // this is used for production.
        });
        console.log('[HeadersScan] Database & tables created!');
    } catch (error) {
        console.error('[HeadersScan] Unable to sync to the database:', error);
    }
})();