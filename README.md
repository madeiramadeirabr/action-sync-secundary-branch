# action-sync-secundary-branch

## Descrição
Essa ação sincroniza a branch derivada da branch principal que for passada por parâmetro.

## Squad:
[SRE Team](https://github.com/orgs/madeiramadeirabr/teams/team-platform-services 'SRE Team')

## Requisitos:
- Usar em Pull Request mergeado
## Exemplo de uso
```yml
uses: madeiramadeirabr/action-sync-secundary-branch@0.1.0
with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    branch-secundary: 'staging'  
```