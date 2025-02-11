import { CommonModule,  } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-annonce-list',
  standalone: true,
  imports: [

    FormsModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './annonce-list.component.html',
  styleUrl: './annonce-list.component.scss'
})
export class AnnonceListComponent  {



}
