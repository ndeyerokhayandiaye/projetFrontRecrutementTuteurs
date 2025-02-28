import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user-service.service';
import { baseUrl } from '../../../services/url';

@Component({
  selector: 'app-manage-candidates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './manage-candidates.component.html',
  styleUrls: ['./manage-candidates.component.scss']
})
export class ManageCandidatesComponent implements OnInit {
  candidateForm: FormGroup;
  isEditMode = false;
  currentCandidateEmail = '';
  displayedColumns: string[] = ['firstName',  'email','createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isSuperAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.candidateForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadCandidates();

    // Ajouter des écouteurs d'événements pour le modal
    const modalElement = document.getElementById('candidateModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        // Nettoyer le backdrop quand le modal est caché
        document.body.classList.remove('modal-open');
        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].parentNode?.removeChild(backdrops[0]);
        }
      });
    }

    // Vérifier si l'utilisateur est le super admin
    const userConnect = localStorage.getItem('userConnect');
    if (userConnect) {
      const user = JSON.parse(userConnect);
      this.isSuperAdmin = user.email === 'admin@admin.com';
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadCandidates() {
    this.userService.getAllCandidates().subscribe({
      next: (candidates) => {
        this.dataSource.data = candidates;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des candidats', err);
        this.showAlert('Erreur', 'Impossible de charger la liste des candidats', 'error');
      }
    });
  }

  // Dans manage-candidates.component.ts
getProfileImageUrl(profilePicture: string | undefined): string {
  if (!profilePicture) {
    return '/assets/images/avatar.png'; // URL par défaut pour les utilisateurs sans photo
  }
  return `${baseUrl}/files/images/${profilePicture}`;
}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  saveCandidate() {
    if (this.candidateForm.valid) {
      const candidateData = this.candidateForm.value;

      if (this.isEditMode) {
        // Modification d'un candidat existant
        const updateData = { ...candidateData };

        // Si le mot de passe est vide, le supprimer pour ne pas l'écraser
        if (!updateData.password) {
          delete updateData.password;
        }

        // Assurer que le rôle reste CANDIDATE
        updateData.role = 'CANDIDATE';

        this.userService.updateUser(this.currentCandidateEmail, updateData).subscribe({
          next: (response) => {
            this.showAlert('Succès', 'Candidat mis à jour avec succès!', 'success');
            this.resetForm();
            this.loadCandidates();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour du candidat', err);
            this.showAlert('Erreur', 'Impossible de mettre à jour le candidat. Veuillez réessayer.', 'error');
          }
        });
      } else {
        // Création d'un nouveau candidat
        candidateData.role = 'CANDIDATE';

        this.userService.createAdmin(candidateData).subscribe({
          next: (response) => {
            // response est maintenant une chaîne de texte
            this.showAlert('Succès', 'Candidat créé avec succès!', 'success');
            this.resetForm();
            this.loadCandidates();
            this.closeModal();
          },
          error: (err) => {
            // Vérifier si l'erreur est due à un problème de parsing mais le statut est 201
            if (err.status === 201) {
              // Considérer comme un succès
              this.showAlert('Succès', 'Candidat créé avec succès!', 'success');
              this.resetForm();
              this.loadCandidates();
              this.closeModal();
            } else {
              console.error('Erreur lors de la création du candidat', err);
              this.showAlert('Erreur', 'Impossible de créer le candidat. Veuillez réessayer.', 'error');
            }
          }
        });
      }
    }
  }

  editCandidate(candidate: any) {
    // Passer en mode édition
    this.isEditMode = true;
    this.currentCandidateEmail = candidate.email;

    // Préremplir le formulaire avec les données du candidat
    this.candidateForm.patchValue({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber || ''
    });

    // Rendre le champ email en lecture seule car c'est l'identifiant
    this.candidateForm.get('email')?.disable();

    // Rendre le mot de passe optionnel en mode édition
    this.candidateForm.get('password')?.clearValidators();
    this.candidateForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.candidateForm.get('password')?.updateValueAndValidity();

    // Ouvrir la modal
    const modalElement = document.getElementById('candidateModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  deleteCandidate(email: string) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action ne peut pas être annulée!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3f51b5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(email).subscribe({
          next: () => {
            this.showAlert('Supprimé!', 'Le candidat a été supprimé.', 'success');
            this.loadCandidates();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.showAlert('Erreur', 'Impossible de supprimer le candidat.', 'error');
          }
        });
      }
    });
  }

  closeModal() {
    this.resetForm();
    const modalElement = document.getElementById('candidateModal');
    if (modalElement) {
      // Utilisation de Bootstrap pour fermer le modal
      // @ts-ignore
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Nettoyer le backdrop et la classe modal-open
    document.body.classList.remove('modal-open');
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].parentNode?.removeChild(backdrops[0]);
    }
  }
  resetForm() {
    // Réinitialiser le formulaire et le mode d'édition
    this.isEditMode = false;
    this.currentCandidateEmail = '';
    this.candidateForm.reset();

    // Réactiver le champ email
    this.candidateForm.get('email')?.enable();

    // Rétablir les validateurs par défaut
    this.candidateForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.candidateForm.get('password')?.updateValueAndValidity();
  }

  showAlert(title: string, text: string, icon: any) {
    Swal.fire({
      title,
      text,
      icon,
      timer: 2000,
      timerProgressBar: true
    });
  }
}