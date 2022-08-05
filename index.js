
const { Octokit } = require("@octokit/core")
const github = require('@actions/github')
const core = require('@actions/core')
const githubToken = core.getInput('github-token')
const octokit = new Octokit({ auth: githubToken})
const branch_secundary =  core.getInput('branch-secundary')

async function run (){
    if(githubToken){
        let branch_event = github.context.payload.ref.split('/')[2]
        if(branch_event == github.context.payload.repository.default_branch){
            try{

                if(branch_secundary == ''){
                    throw new Error('É necessário passar a branch secundária por parâmetro!')
                }
                
                let {id} = github.context.payload.commits[0]
                
                let {number} = await getNumberPullRequestByCommit(id)
                
                if(number == null){
                    throw new Error('Error não foi encontrar Pull Request mergeada!')
                }

                let getPullRequestBranchHeadResponse = await getPullRequestBranchHead(number)
                
                if(getPullRequestBranchHeadResponse.status != 200){
                    throw new Error('Erro ao encontrar Pull Request!')
                }
                
                let createPullRequestResponse = await createPullRequest(getPullRequestBranchHeadResponse.data.head.ref, branch_secundary)
                console.log('teste response ',createPullRequestResponse.status )
                if(createPullRequestResponse.status != 201){
                    throw new Error( 'Error ao criar Pull Request!')
                }

                let mergeBranchSecundaryResponse = await mergeBranchSecundary(createPullRequestResponse.data.number)

                if(mergeBranchSecundaryResponse.status != 200){
                    throw new Error('Error ao realizar merge!')
                }
                core.setOutput("success", `branch ${branch_secundary} atualizada`)
                console.log(`branch ${branch_secundary} atualizada!`)
            }catch(error){
                core.setFailed(error)
            }
        }else{
            core.setFailed('Esta action só será executada quando a branch for mesclada com a branch padrão!')
        }
    }else{
        core.setFailed('O token do Github é obrigatório!')
    }    
}

async function getNumberPullRequestByCommit(commitSha){

    let res = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        commit_sha: commitSha
    })
    let {number} = res.data.pop();
    
    return {
        number: number
    }
    
}

async function getPullRequestBranchHead(number){
    return octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        pull_number: number
    })
}

async function createPullRequest(head, branch_secundary){
    console.log(head, branch_secundary)
   return  octokit.request('POST /repos/{owner}/{repo}/pulls', {
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        title: `feat: update branch ${branch_secundary}`,
        body: '',
        head: head,
        base: branch_secundary
    })
}

async function mergeBranchSecundary(number){
   return octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        pull_number: number
    })
}

run()