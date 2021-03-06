const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsf = require("jsonfile");

const redblue = ['blue', 'blue', 'red', 'red'];

const propconst = (numbertrue, ccwm, opr, descore, capflip, capstack, vcatapult, vflywheel) => {
    const scaledscore = ccwm * (descore + capflip + capstack + vcatapult + vflywheel) + (numbertrue * opr * ccwm)
    const percentage = 10 * Math.abs(scaledscore / (opr * ccwm))
    return Math.round(percentage * 100) / 100
}

const alliancestrength = (oprblue, oprred, confidence1, confidence2, ccwmblue, ccwmred) => {
    const scaledstrength = (confidence1 * confidence2) * Math.abs(confidence1 - confidence2) / Math.pow(Math.abs(oprblue - oprred), 2)
    const alliancestrength = scaledstrength / Math.abs(ccwmred - ccwmblue)
    return 100 * Math.round(alliancestrength * 100) / 100
}

require('dotenv').config();

const PORT = process.env.PORT || 5000

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    const fields = ['teamName', 'descore', 'flipcaps', 'stackcaps', 'catapult', 'flywheel'];
    const questionphrases = ['teamName', 'descore', 'flip caps', 'stack caps', 'have a catapult', 'have a flywheel']
    res.render("landing", {
        redblue: redblue,
        inputfields: fields,
        questionphrases: questionphrases
    });
});

app.get("/stats", (req, res) => {
    const query = req.query;
    let name0 = query.blue_teamName0
    let name1 = query.blue_teamName1
    let name2 = query.red_teamName2
    let name3 = query.red_teamName3
    let queryfields0 = [query.descore0, query.flipcaps0, query.stackcaps0, query.catapult0, query.flywheel0]
    let numbertrue0 = 0
    for (let i = 0; i < queryfields0.length; i++) {
        if (queryfields0[i] == 'true') {
            numbertrue0 += 1
        }
    }
    let queryfields1 = [query.descore1, query.flipcaps1, query.stackcaps1, query.catapult1, query.flywheel1]
    let numbertrue1 = 0
    for (let i = 0; i < queryfields1.length; i++) {
        if (queryfields1[i] == 'true') {
            numbertrue1 += 1
        }
    }
    let queryfields2 = [query.descore2, query.flipcaps2, query.stackcaps2, query.catapult2, query.flywheel2]
    let numbertrue2 = 0
    for (let i = 0; i < queryfields2.length; i++) {
        if (queryfields2[i] == 'true') {
            numbertrue2 += 1
        }
    }
    let queryfields3 = [query.descore3, query.flipcaps3, query.stackcaps3, query.catapult3, query.flywheel3]
    let numbertrue3 = 0
    for (let i = 0; i < queryfields3.length; i++) {
        if (queryfields3[i] == 'true') {
            numbertrue3 += 1
        }
    }
    jsf.readFile("public/rishi.json")
        .then(obj => {
            let percentage0 = propconst(numbertrue0, obj[name0]['ccwm'], obj[name0]['opr'], Number(query.importance_descore0), Number(query.importance_flipcaps0), Number(query.importance_stackcaps0), Number(query.importance_catapult0), Number(query.importance_flywheel0))
            let percentage1 = propconst(numbertrue1, obj[name1]['ccwm'], obj[name1]['opr'], Number(query.importance_descore1), Number(query.importance_flipcaps1), Number(query.importance_stackcaps1), Number(query.importance_catapult1), Number(query.importance_flywheel1))
            let percentage2 = propconst(numbertrue2, obj[name2]['ccwm'], obj[name2]['opr'], Number(query.importance_descore2), Number(query.importance_flipcaps2), Number(query.importance_stackcaps2), Number(query.importance_catapult2), Number(query.importance_flywheel2))
            let percentage3 = propconst(numbertrue3, obj[name3]['ccwm'], obj[name3]['opr'], Number(query.importance_descore3), Number(query.importance_flipcaps3), Number(query.importance_stackcaps3), Number(query.importance_catapult3), Number(query.importance_flywheel3))
            let ccwmred = obj[name2]["ccwm"] + obj[name3]["ccwm"]
            let ccwmblue = obj[name0]["ccwm"] + obj[name1]["ccwm"]
            let oprblue = obj[name0]["opr"] + obj[name1]["opr"]
            let oprred = obj[name2]["opr"] + obj[name3]["opr"]

            const alliancestrengthblue = alliancestrength(oprblue, oprred, percentage0, percentage1, ccwmblue, ccwmred)
            const alliancestrengthred = alliancestrength(oprblue, oprred, percentage2, percentage3, ccwmblue, ccwmred)
            const alliancestrengths = [alliancestrengthblue, alliancestrengthred]
            const percentages = [percentage0, percentage1, percentage2, percentage3]
            const teams = [name0, name1, name2, name3]
            const teamdata = []
            const colors = ['rgba(33, 106, 224, 0.5)', 'rgba(33, 106, 224, 0.5)', 'rgba(209, 3, 0, 0.5)', 'rgba(209, 3, 0, 0.5)']
            const labels = ["wins", "losses", "ccwm", "opr", "dpr"]
            for (let j = 0; j < 4; j++) {
                let currentTeam = obj[teams[j]]
                let currentTeamData = [currentTeam["wins"], currentTeam["losses"], currentTeam["ccwm"], currentTeam["opr"], currentTeam["dpr"]]
                teamdata.push(currentTeamData);
            }
            res.render("stats", {
                obj: obj,
                query: query,
                redblue: redblue,
                percentages: percentages,
                teams: teams,
                teamdata: teamdata,
                labels: labels,
                colors: colors,
                alliancestrengths: alliancestrengths
            })
        })
        .catch(error => console.log(error))
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `)
});