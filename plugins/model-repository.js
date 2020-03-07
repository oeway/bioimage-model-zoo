import { randId, getUrlParameter } from './utils.js'

class ModelRepository {
  constructor () {
    this.models = []
    this.allLabels = []
  }

  async init () {
    try {
      let repo
      let repositoryURL
      const queryRepo = getUrlParameter('repo')

      if (queryRepo) {
        if (queryRepo.startsWith('http') || queryRepo.startsWith('/')) {
          repositoryURL = queryRepo
        } else if (queryRepo.split('/').length === 2) {
          repositoryURL = `https://raw.githubusercontent.com/${queryRepo}/master/manifest.model.json`
        } else if (queryRepo.split('/').length === 3) {
          repositoryURL = `https://raw.githubusercontent.com/${queryRepo}/manifest.model.json`
        } else {
          alert('Unsupported repo format.')
          throw new Error('Unsupported repo format.')
        }
        repo = queryRepo
      } else {
        repo = 'bioimage-io/bioimage-io-models'
        repositoryURL = 'https://raw.githubusercontent.com/bioimage-io/bioimage-io-models/master/manifest.model.json'
      }

      const response = await fetch(repositoryURL + '?' + randId())
      const repoManifest = JSON.parse(await response.text())
      const models = repoManifest.models
      for (const model of models) {
        model.repo = repo
        model.model_uri = `${repo}:${model.name}`
        if (!model.config_url.startsWith('http')) { model.config_url = model.root_url + '/' + model.config_url }
      }
      this.models = this.models.concat(models)
      this.apps_source = repoManifest.applications
    } catch (e) {
      console.error(e)
      alert(`Failed to fetch manifest file from the repo: ${e}.`)
    }

    this.models.forEach((model) => {
      model.allLabels = model.labels || []
      if (model.license) {
        model.allLabels.push(model.license)
      }
      if (model.tags) {
        model.allLabels = model.allLabels.concat(model.tags)
      }
      if (model.covers && model.covers.length > 0) {
        // resolve relative path to the cover image
        if (!model.covers[0].startsWith('http')) {
          model.cover_image = encodeURI(model.root_url + '/' + model.covers[0])
        } else {
          model.cover_image = encodeURI(model.covers[0])
        }
        if (model.cover_image.includes('(') || model.cover_image.includes(')')) {
          console.error('cover image file name cannot contain brackets.')
        }
        // TODO: show all the cover images
      } else {
        model.cover_image = ''
      }
    })
    this.models.forEach((model) => {
      model.allLabels.forEach((label) => {
        if (!this.allLabels.includes(label)) {
          this.allLabels.push(label)
        }
      })
    })
    this.allLabels.sort((a, b) =>
      a.toLowerCase() < b.toLowerCase() ? -1 : 1
    )
  }
}

export default ({ app }, inject) => {
  // Set the function directly on the context.app object
  app.repository = new ModelRepository()
}
