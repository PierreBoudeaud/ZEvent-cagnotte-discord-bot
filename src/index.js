const ZEVENT_API = 'https://zevent.fr/api/data.json';
const fetch = require('node-fetch');
const CONFIG = require('./config/config.json');
const DISCORD_WEBHOOK = `https://discordapp.com/api/webhooks/${CONFIG.webhook.id}/${CONFIG.webhook.token}`;

let lastDonation = -1;

exec();
setInterval(async () => {
    exec();
}, 60000);

async function exec() {
    const [donationFormatted, donationNumber] = await getDonationAmountFormatted();
    const diffDonation = calculDiffDonation(donationNumber);
    let msg = `La cagnotte est de ${donationFormatted} à ${(new Date()).toLocaleTimeString()}`;
    if (!!diffDonation) {
        msg += `\n${diffDonation.toLocaleString()} € levé en 1 minute.`;
    }
    console.log(donationFormatted);
    sendMessage(msg)
        .then(() => console.log('msg sended'))
        .catch(err => console.error(err));
}

/**
 * @returns {number}
 */
function calculDiffDonation(currentDonation) {
    let diffDonation;
    if (lastDonation > -1) {
        diffDonation = currentDonation - lastDonation;
    }
    lastDonation = currentDonation;
    return diffDonation;
}

async function getDonationAmountFormatted() {
    return fetch(ZEVENT_API)
    .then(raw => raw.json())
    .then(data => [data.donationAmount.formatted, data.donationAmount.number]);
}

async function sendMessage(msg) {
    const body = {
        "username": "ZEvent",
        "avatar_url": "https://zevent.fr/assets/images/zevent.png",
        "embeds": [{
            "description": msg,
            "color": 4962865,
            'title': `ZEvent ${CONFIG.general.version} - ${CONFIG.general.entity}`
        }]
    };

    fetch(DISCORD_WEBHOOK, { method: 'POST', body: JSON.stringify(body), headers: {
		'Content-type': 'application/json; charset=UTF-8'
	}})
        .catch(err => console.error(err));
}