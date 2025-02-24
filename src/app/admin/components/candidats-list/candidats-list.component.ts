import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-candidats-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule,RouterModule,MatPaginatorModule,
     ReactiveFormsModule,
          MatIconModule,
          MatFormFieldModule,
          MatInputModule,
          MatPaginatorModule,
          MatTableModule,
          RouterModule,
          MatSelectModule,
          MatOptionModule,
          HttpClientModule,
  ],
  templateUrl: './candidats-list.component.html',
  styleUrl: './candidats-list.component.scss'
})
export class CandidatsListComponent implements OnInit {
  users: any[] = [];
  searchQuery: string = '';
  loading = false;
  dataSource: any[] = [];

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  // 🔹 Charger tous les utilisateurs
  getUsers() {
    this.loginService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  // 🔹 Supprimer un utilisateur
  deleteUser(email: string) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.loginService.deleteUser(email).subscribe(
        () => {
          this.users = this.users.filter(user => user.email !== email);
          console.log('Utilisateur supprimé');
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
        }
      );
    }
  }

  onSearch() {
    this.users = this.users.filter((user) =>
      user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }


  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  //   this.users = this.users.filter(user =>
  //     user.firstName.toLowerCase().includes(filterValue) ||
  //     user.email.toLowerCase().includes(filterValue)
  //   );
  // }

}
