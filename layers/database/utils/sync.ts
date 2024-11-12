import {app} from "electron";
import path from "path";
import sqlite3 from "sqlite3";
import fs from "fs";
import databasePath from "../../utils/databasePath";

export async function createSQLiteFile(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(path.dirname(databasePath), { recursive: true });
        } catch (err: any) {
            if (err.code !== 'EEXIST') {
                console.error('Lỗi khi tạo thư mục:', err);
                resolve({
                    success: false,
                    message: 'Lỗi khi tạo thư mục database'
                });
            }
        }

        const db = new sqlite3.Database(databasePath, (err) => {
            if (err) {
                console.error('Lỗi khi tạo file SQLite:', err);
                resolve({
                    success: false,
                    message: 'Lỗi khi tạo file SQLite'
                });
            }
        });
        db.close();
        console.log('File SQLite đã được tạo thành công:', databasePath);
        resolve({
            success: true,
            message: 'File SQLite đã được tạo thành công'
        });
    });
}