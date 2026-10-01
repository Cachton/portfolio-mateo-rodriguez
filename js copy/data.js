const AIRTABLE_TOKEN = "patMIYt4wE2L0laZh.748dab0f62cdb5c833eb8eb5eb2d930a631b7d511f916c21fafe33052a4a2074";
const AIRTABLE_TABLE_NAME = "tbl8q88n5psy8QAc3";
const AIRTABLE_BASE_ID = "appgQISY45dza4nag";

//fetching du data airtable
async function fetchData() {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
    });
    return await response.json();
}

//
async function init() {
    let projectsArray = [];
    const projects = await fetchData();
    projects.records.forEach(project => {
        projectsArray.push(project.fields);
    });

    //fait le tri dans les projets selon l'id
    projectsArray.sort((a, b) => a.id - b.id);

    //
    projectsArray.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.textContent = project.titre;
        document.querySelector(`.projets__grille`).appendChild(projectCard);
    });


}

init();