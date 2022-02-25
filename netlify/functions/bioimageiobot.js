// This netlify function allows trigger github actions with an http request,
// for example: https://bioimage.netlify.app/.netlify/functions/bioimageiobot?action=notify&source=https://zenodo.org/api/files/3f422e1b-a64e-40d3-89d1-29038d2f405d/rdf.yaml
const request = require('request');
const yaml = require('js-yaml');
const workflowId = "update_collection.yaml"

const cors_headers = {
    'Access-Control-Allow-Origin': 'https://bioimage.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST'
};
  
function dispatch_workflow(workflowId, token) {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.github.com/repos/bioimage-io/collection-bioimage-io/actions/workflows/${workflowId}/dispatches`,
            method: 'POST',
            headers: {"Accept": "application/vnd.github.v3+json", "Authorization": `token ${token}`, 'user-agent': 'bioimage-bot'},
            body: JSON.stringify({
                'ref' : 'main'
            })
        };

        request(options, function(err, res, body) {
            if(err){
                reject(`Invalid response (code: ${res.statusCode}, ${res})`);
                return
            }
            if(res.statusCode === 204) {
                resolve()
            }     
            else{
                console.log(body)
                reject(`Invalid response (code: ${res.statusCode}, ${body})`);
            }
        });
    })
}

function check_waiting_workflow(workflowName, token) {
    return new Promise((resolve, reject) => {
        const url = `https://api.github.com/repos/bioimage-io/collection-bioimage-io/actions/runs?status=waiting&branch=main`
        const options = {
            url,
            method: 'GET',
            headers: {"Accept": "application/vnd.github.v3+json", "Authorization": `token ${token}`, 'user-agent': 'bioimage-bot'},
        };

        request(options, function(err, res, body) {
            if(err){
                reject(`Invalid response (code: ${res.statusCode}, ${res})`);
                return
            }
            try{
                if(res.statusCode === 200) {
                    const ret = JSON.parse(body)
                    const waiting_workflow = ret.workflow_runs.filter(w => {
                        return w.name === workflowName && w.status === "waiting"
                    })
                    console.log(`Waiting workflows (name=${workflowName}): ${waiting_workflow.length}`)
                    resolve(waiting_workflow.length)
                }     
                else{
                    console.log(body)
                    reject(`Invalid response (code: ${res.statusCode}, ${body})`);
                }
            }
            catch(e){
                reject(e)
            }
        });
    })
}



function get(url){
    return new Promise((resolve, reject) => {
        request({
            url,
            method: "GET",
            headers: {'user-agent': 'bioimage-bot'},
        }, function(err, res, body) {
            if(err){
                reject(`Invalid response (code: ${res.statusCode}, ${res})`);
                return
            }
            if(res.statusCode === 200) {
                resolve(body)
            }     
            else{
                console.log(body)
                reject(`Invalid response (code: ${res.statusCode}, ${body})`);
            }
        })
    })
}

exports.handler = async function(event, context) {
    const source = event.queryStringParameters.source
    const action = event.queryStringParameters.action
    if(!action){
        return { statusCode: 500, headers: cors_headers, body: "Please specify an action"}
    }
    if(action === 'notify'){
         // const resource_id = event.queryStringParameters.id
        const { GITHUB_TOKEN } = process.env;
        if(!GITHUB_TOKEN){
            return { statusCode: 500, headers: cors_headers, body: "server function is not configured properly (requires GITHUB_TOKEN env variable)"}
        }
        if(!source){
            return { statusCode: 403, headers: cors_headers, body: "Please provide a RDF source URL in the query string"}
        }
        if(!source.startsWith("http")){
            return { statusCode: 403, headers: cors_headers, body: "Invalid RDF source url, it must be a valid URL"}
        }
        const sourceContent = await get(source)
        if(source.split("?")[0].endsWith(".yaml")){
            let resource;
            try{
                resource = yaml.load(sourceContent)
                // TODO: check if the resource is worth to to run a workflow
            }
            catch(e){
                return { statusCode: 403, headers: cors_headers, body: `Failed to parse the source file: ${e}`}
            }
        }
        else{
            return { statusCode: 403, headers: cors_headers, body: "Invalid RDF source file type, only yaml is supported for now"}
        }
        // check if the workflow is already waiting in the queue
        // if(await check_waiting_workflow("generate auto-update PRs", GITHUB_TOKEN) > 0){
        //     return {
        //         statusCode: 200,
        //         body: JSON.stringify({source, success: true, new_workflow: false, message: "A previous workflow is already waiting in the queue"})
        //     };
        // }
        await dispatch_workflow(workflowId, GITHUB_TOKEN)
        return {
            statusCode: 200,
            headers: cors_headers,
            body: JSON.stringify({source, success: true, new_workflow: true, message: "A new workflow run has dispatched."})
        };
    }
    else{
        return {
            statusCode: 403,
            headers: cors_headers,
            body: `Unsupported action: ${action}`
        };
    }
   
};