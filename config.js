require("dotenv").config();

module.exports = {
    token: process.env.TOKEN,
    mongoURI: "mongodb+srv://kamdynlovesfootball_db_user:HpZvkE1XrOlhv52H@cluster0.zytux9c.mongodb.net/",
    clientId: "1517886043649474661",
    cookieApiKey: "sk_live_3R8FKNtvKUk2JiW3ApdQ8veIyr5eCpmv9ML6pEf7iqFq3pb9uiP7fYKcWLQcd58b",
    docksysApiKey: "I6NbvPgioSb9.RTiDYf.INZpA7KJBIYcc6xaDMf386p385wr",

    rulesChannelId: "1515512340886323201",

    transcriptChannelId: "1515517886989340804",
    
    topBanner: "https://cdn.discordapp.com/attachments/1517876909076123799/1517890381235224616/rules.png?ex=6a37ed13&is=6a369b93&hm=a9c854f7a51ab6051316550e1532bc41b07e5a3fb5f7e25c142c410bcbabc869",
    bottomBanner: "https://cdn.discordapp.com/attachments/1517876909076123799/1517877001501806653/Untitled_design_70.png?ex=6a37e09d&is=6a368f1d&hm=5a3ed57e6d4eb00d9911a6e632b665ce4087bd263c555edcf2191976b9f251bb",

    tickettop: "https://cdn.discordapp.com/attachments/1517876909076123799/1517876979326648521/Untitled_design_71.png?ex=6a37e098&is=6a368f18&hm=3dc3081da920b1676b5365a22017fe003140d84f975e7800c10e2bbf5ac29c43",

    ticketbottom: "https://cdn.discordapp.com/attachments/1517876909076123799/1517877001501806653/Untitled_design_70.png?ex=6a37e09d&is=6a368f1d&hm=5a3ed57e6d4eb00d9911a6e632b665ce4087bd263c555edcf2191976b9f251bb",

    ticketPanelChannel: "1515512994606616609",

    ticketCategories: {
        general: {
            categoryId: "1515514456694849557",
            roleId: "1515511591473254471"
        },

        developer: {
            categoryId: "1515514456694849557",
            roleId: "1517580278376435882"
        },

        bugreport: {
            categoryId: "1515514456694849557",
            roleId: "1517580278376435882"
        }
    }
};
