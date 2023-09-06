import {Service} from "./main";

let service = new Service()
// get args
let args = process.argv.slice(2);
console.log(args)
;(async () => {
    switch (args[0]) {
        case "updateNotionButton":
            await service.updateNotionButton()
            console.log("updateNotionRepoInfo over")
            break;
    }
})()
