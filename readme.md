Napp logger. log to write file


# install
```
npm i @napp/logger-file
```

# use

``` typescript
import { LogLevel, LogManager, sampleLogWriter } from "@napp/logger";
import { logWriter2file } from "@napp/logger-file";



// LogManager.addWriter({
//     level: LogLevel.info,
//     writer: sampleLogWriter()
// })

LogManager.addWriter({    
    level: LogLevel.info,
    writer: logWriter2file({
        filename: `./log/%DATE%`,
        frequency: "daily",
        date_format: "YYYY-MM-DD",
        size: "100M",
        max_logs: '30d',
        extension: ".log",
        audit_file: "./log/audit.json",
        create_symlink: true,
        symlink_name: `./log/current.log`,
    })
})


```