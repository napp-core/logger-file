import { ILogItem, ILogWriter, LogLevel } from "@napp/logger"
import * as FileStreamRotator from 'file-stream-rotator'
import * as JSON from 'flatted';
export type FileOptions = {
    flags?: string
    encoding?: string
    mode?: number
    autoClose?: boolean
    emitClose?: boolean
}

export interface OWriter2file {
    /** Filename including full path used by the stream */
    filename: string
    /** 
     * How often to rotate. Options are 'daily', 'custom' and 'test'. 'test' rotates every minute. 
     * 
     * If frequency is set to none of the above, a YYYYMMDD string will be added to the end of the filename.
     */
    frequency?: string
    /** If set, it will use console.log to provide extra information when events happen. Default is false  */
    verbose?: boolean
    /**
     * Use 'Y' for full year, 'M' for month, 'D' for day, 'H' for hour, 'm' for minutes, 's' for seconds
     * If using 'custom' frequency, it is used to trigger file change when the string representation changes.
     * 
     * It will be used to replace %DATE% in the filename.
     */
    date_format?: string
    /** 
     * Max size of the file after which it will rotate. It can be combined with frequency or date format.
     * The size units are 'k', 'm' and 'g'. Units need to directly follow a number e.g. 1g, 100m, 20k.
     */
    size?: string
    /**
     * Max number of logs to keep. If not set, it won't remove past logs. It uses its own log audit file
     * to keep track of the log files in a json format. It won't delete any file not contained in it.
     * It can be a number of files or number of days. If using days, add 'd' as the suffix. e.g., '10d' for 10 days.
     */
    max_logs?: string;
    /** Location to store the log audit file. If not set, it will be stored in the root of the application. */
    audit_file?: string
    /**
     * An object passed to the stream. This can be used to specify flags, encoding, and mode.
     * See https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options. Default `{ flags: 'a' }`.
     */
    file_options?: FileOptions
    /** Use UTC time for date in filename. Defaults to 'false' */
    utc?: boolean
    /**
     * File extension to be appended to the filename. This is useful when using size restrictions as the rotation
     * adds a count (1,2,3,4,...) at the end of the filename when the required size is met.
     */
    extension?: string

    // watch_log?: boolean
    /**
     * Create a tailable symlink to the current active log file. Defaults to 'false'
     */
    create_symlink?: boolean
    /**
     * Name to use when creating the symbolic link. Defaults to 'current.log'
     */
    symlink_name?: string
    /** Use specified hashing algorithm for audit. Defaults to 'md5'. Use 'sha256' for FIPS compliance. */
    audit_hash_type?: "md5" | "sha256"
}

export function logWriter2file(opt: OWriter2file): ILogWriter {
    let stream = FileStreamRotator.getStream({
        ...opt,
        end_stream: false
    });

    let writer: ILogWriter = (l: ILogItem) => {

        let row1 = `[${new Date(l.timestamp).toLocaleString()}] [${LogLevel[l.level]}] [${l.logname}]`;
        let row2 = `${l.message}`;
        let row3 = '';
        if (l.attrs) {
            try {
                row3 = JSON.stringify(l.attrs);
            } catch (error) {
                row3 = '' + error;
            }
        }



        let logrow = [row1, row2, row3, ''].join("\r\n");

        try {
            stream.write(logrow);
        } catch (error) {
            console.error(error);
        }
    }

    writer.onRemoved = () => {
        stream.end("\r\n");
    }

    return writer;
}