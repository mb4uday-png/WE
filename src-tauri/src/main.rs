// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::command;

#[derive(Serialize, Deserialize, Debug)]
struct EstimateItem {
    description: String,
    quantity: f64,
    unit_price: f64,
    amount: f64,
}

#[derive(Serialize, Deserialize, Debug)]
struct Estimate {
    id: Option<i64>,
    client_name: String,
    project_name: String,
    items: Vec<EstimateItem>,
    total_amount: f64,
    created_at: Option<String>,
    updated_at: Option<String>,
}

fn init_database() -> Result<Connection> {
    let conn = Connection::open("estimates.db")?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS estimates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clientName TEXT NOT NULL,
            projectName TEXT NOT NULL,
            totalAmount REAL NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS estimate_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estimateId INTEGER NOT NULL,
            description TEXT NOT NULL,
            quantity REAL NOT NULL,
            unitPrice REAL NOT NULL,
            amount REAL NOT NULL,
            FOREIGN KEY (estimateId) REFERENCES estimates(id) ON DELETE CASCADE
        )",
        [],
    )?;

    Ok(conn)
}

#[command]
fn get_estimates() -> Result<Vec<Estimate>, String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT * FROM estimates ORDER BY updatedAt DESC").map_err(|e| e.to_string())?;
    let estimate_iter = stmt.query_map([], |row| {
        Ok(Estimate {
            id: row.get(0)?,
            client_name: row.get(1)?,
            project_name: row.get(2)?,
            total_amount: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
            items: vec![],
        })
    }).map_err(|e| e.to_string())?;

    let mut estimates = vec![];
    for estimate_result in estimate_iter {
        let mut estimate = estimate_result.map_err(|e| e.to_string())?;
        let mut stmt_items = conn.prepare("SELECT description, quantity, unitPrice, amount FROM estimate_items WHERE estimateId = ?").map_err(|e| e.to_string())?;
        let items_iter = stmt_items.query_map([estimate.id], |row| {
            Ok(EstimateItem {
                description: row.get(0)?,
                quantity: row.get(1)?,
                unit_price: row.get(2)?,
                amount: row.get(3)?,
            })
        }).map_err(|e| e.to_string())?;
        for item in items_iter {
            estimate.items.push(item.map_err(|e| e.to_string())?);
        }
        estimates.push(estimate);
    }
    Ok(estimates)
}

#[command]
fn save_estimate(estimate: Estimate) -> Result<i64, String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO estimates (clientName, projectName, totalAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
        params![estimate.client_name, estimate.project_name, estimate.total_amount, now, now],
    ).map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    for item in estimate.items {
        conn.execute(
            "INSERT INTO estimate_items (estimateId, description, quantity, unitPrice, amount) VALUES (?, ?, ?, ?, ?)",
            params![id, item.description, item.quantity, item.unit_price, item.amount],
        ).map_err(|e| e.to_string())?;
    }
    Ok(id)
}

#[command]
fn update_estimate(estimate: Estimate) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE estimates SET clientName = ?, projectName = ?, totalAmount = ?, updatedAt = ? WHERE id = ?",
        params![estimate.client_name, estimate.project_name, estimate.total_amount, now, estimate.id],
    ).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM estimate_items WHERE estimateId = ?", [estimate.id]).map_err(|e| e.to_string())?;
    for item in estimate.items {
        conn.execute(
            "INSERT INTO estimate_items (estimateId, description, quantity, unitPrice, amount) VALUES (?, ?, ?, ?, ?)",
            params![estimate.id, item.description, item.quantity, item.unit_price, item.amount],
        ).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
fn delete_estimate(id: i64) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM estimates WHERE id = ?", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn export_to_excel(estimates: Vec<Estimate>) -> Result<String, String> {
    // For simplicity, just return a placeholder
    // Implement Excel export using a crate like calamine or simple CSV
    Ok("exported.xlsx".to_string())
}

#[command]
fn import_from_excel() -> Result<Vec<Estimate>, String> {
    // Placeholder
    Ok(vec![])
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_estimates,
            save_estimate,
            update_estimate,
            delete_estimate,
            export_to_excel,
            import_from_excel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}