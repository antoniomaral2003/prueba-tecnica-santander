import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'candidates',
    pathMatch: 'full'
  },
  {
    path: 'candidates',
    loadComponent: () => import('./components/candidates-table/candidates-table.component')
      .then(m => m.CandidatesTableComponent)
  },
  {
    path: 'candidates/new',
    loadComponent: () => import('./components/candidate-form/candidate-form.component')
      .then(m => m.CandidateFormComponent)
  },
  {
    path: 'candidates/edit/:id',
    loadComponent: () => import('./components/candidate-form/candidate-form.component')
      .then(m => m.CandidateFormComponent)
  },
  {
    path: '**',
    redirectTo: 'candidates'
  }

];
