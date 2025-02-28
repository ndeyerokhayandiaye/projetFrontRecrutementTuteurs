import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user-service.service';

@Component({
  selector: 'app-manage-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.scss']
})
export class ManageAdminComponent implements OnInit {
  adminForm: FormGroup;
  isEditMode = false;
  currentAdminEmail = '';
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isSuperAdmin = false;
  currentUserEmail = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();

    const modalElement = document.getElementById('adminModal');
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
      this.currentUserEmail = user.email || '';
      this.isSuperAdmin = this.currentUserEmail === 'admin@admin.com';
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadAdmins() {
    this.userService.getAllAdmins().subscribe({
      next: (admins) => {
        // Filtrer le super admin (admin@admin.com) de la liste pour les autres admins
        if (this.currentUserEmail !== 'admin@admin.com') {
          this.dataSource.data = admins.filter(admin => admin.email !== 'admin@admin.com');
        } else {
          this.dataSource.data = admins;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des administrateurs', err);
        this.showAlert('Erreur', 'Impossible de charger la liste des administrateurs', 'error');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createAdmin() {
    if (this.adminForm.valid) {
      const adminData = this.adminForm.value;

      if (this.isEditMode) {
        // Modification d'un admin existant
        const updateData = { ...adminData };

        // Si le mot de passe est vide, le supprimer pour ne pas l'écraser
        if (!updateData.password) {
          delete updateData.password;
        }

        this.userService.updateUser(this.currentAdminEmail, updateData).subscribe({
          next: (response) => {
            this.showAlert('Succès', 'Administrateur mis à jour avec succès!', 'success');
            this.resetForm();
            this.loadAdmins();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour de l\'administrateur', err);
            this.showAlert('Erreur', 'Impossible de mettre à jour l\'administrateur. Veuillez réessayer.', 'error');
          }
        });
      } else {
        // Création d'un nouvel admin
        this.userService.createAdmin(adminData).subscribe({
          next: (response) => {
            this.showAlert('Succès', 'Administrateur créé avec succès!', 'success');
            this.resetForm();
            this.loadAdmins();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la création de l\'administrateur', err);
            this.showAlert('Erreur', 'Impossible de créer l\'administrateur. Veuillez réessayer.', 'error');
          }
        });
      }
    }
  }

  editAdmin(admin: any) {
    // Passer en mode édition
    this.isEditMode = true;
    this.currentAdminEmail = admin.email;

    // Préremplir le formulaire avec les données de l'admin
    this.adminForm.patchValue({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email
    });

    // Rendre le champ email en lecture seule car c'est l'identifiant
    this.adminForm.get('email')?.disable();

    // Rendre le mot de passe optionnel en mode édition
    this.adminForm.get('password')?.clearValidators();
    this.adminForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.adminForm.get('password')?.updateValueAndValidity();

    // Ouvrir la modal
    const modalElement = document.getElementById('adminModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  deleteAdmin(email: string) {
    // Empêcher la suppression du super admin
    if (email === 'admin@admin.com') {
      this.showAlert('Action non autorisée', 'Vous ne pouvez pas supprimer le super administrateur.', 'warning');
      return;
    }

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
            this.showAlert('Supprimé!', 'L\'administrateur a été supprimé.', 'success');
            this.loadAdmins();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.showAlert('Erreur', 'Impossible de supprimer l\'administrateur.', 'error');
          }
        });
      }
    });
  }

  closeModal() {
    this.resetForm();
    const modalElement = document.getElementById('adminModal');
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
    this.currentAdminEmail = '';
    this.adminForm.reset();

    // Réactiver le champ email
    this.adminForm.get('email')?.enable();

    // Rétablir les validateurs par défaut
    this.adminForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.adminForm.get('password')?.updateValueAndValidity();
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