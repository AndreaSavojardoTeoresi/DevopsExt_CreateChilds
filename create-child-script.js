const axios = require('axios');

async function main() {
  const webhookPayload = JSON.parse(process.env.WEBHOOK_PAYLOAD);
  const pat = process.env.PAT_TOKEN;
  
  // Accedi ai dati direttamente dalla radice del payload di DevOps
  const parentWorkItemId = webhookPayload.resource.id;
  const parentWorkItemTitle = webhookPayload.resource.fields["System.Title"];
  const organizationUrl = webhookPayload.body.resource.url.split('/_apis/wit')[0];
  
  const newWorkItemDocument = [{
    "op": "add",
    "path": "/fields/System.Title",
    "value": `Nuovo Work Item 'Prova' per: ${parentWorkItemTitle}`
  },
  {
    "op": "add",
    "path": "/fields/System.WorkItemType",
    "value": "Prova"
  },
  {
    "op": "add",
    "path": "/relations/-",
    "value": {
      "rel": "System.LinkTypes.Hierarchy-Reverse",
      "url": `${organizationUrl}/_apis/wit/workitems/${parentWorkItemId}`
    }
  }];
  
  try {
    await axios.patch(
      `${organizationUrl}/_apis/wit/workitems/$${newWorkItemDocument[1].value}?api-version=6.0`,
      newWorkItemDocument, {
        headers: {
          'Content-Type': 'application/json-patch+json',
          'Authorization': 'Basic ' + Buffer.from(':' + pat).toString('base64')
        }
      }
    );
    console.log('Work Item creato con successo.');
  } catch (error) {
    console.error('Errore nella creazione del Work Item:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

main();
