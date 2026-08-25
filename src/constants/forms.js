import { levels, modalities } from './options'

export const initialCompanyForm = {
  name: '',
  logo: '',
  site: '',
  careers: '',
  linkedin: '',
  notes: '',
}

export const createInitialVacancyForm = () => ({
  title: '',
  company: '',
  location: '',
  modality: modalities[0],
  level: levels[0],
  description: '',
  link: '',
  date: new Date().toISOString().split('T')[0],
  tags: '',
})
