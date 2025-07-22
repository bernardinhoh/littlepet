<?php
/**
 * Simple Process Management API
 * Auto-configures SQLite database and provides REST endpoints
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_file = 'processes.db';
$pdo = null;

// Initialize database connection and create table if not exists
function initDatabase() {
    global $pdo, $db_file;
    
    try {
        $pdo = new PDO("sqlite:$db_file");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create processes table if it doesn't exist
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS processes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                numero VARCHAR(50) NOT NULL UNIQUE,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                telefone VARCHAR(20),
                tipo VARCHAR(100),
                status VARCHAR(50) DEFAULT 'Em Andamento',
                observacoes TEXT,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        return true;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        return false;
    }
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($path, '/');

// Initialize database
if (!initDatabase()) {
    exit;
}

// Handle different endpoints
switch ($method) {
    case 'GET':
        if (strpos($path, '/api.php/processes') !== false) {
            // Get all processes with optional search
            $search = $_GET['search'] ?? '';
            
            if ($search) {
                $stmt = $pdo->prepare("
                    SELECT * FROM processes 
                    WHERE numero LIKE ? OR nome LIKE ? OR email LIKE ? OR tipo LIKE ? 
                    ORDER BY data_atualizacao DESC
                ");
                $searchParam = "%$search%";
                $stmt->execute([$searchParam, $searchParam, $searchParam, $searchParam]);
            } else {
                $stmt = $pdo->query("SELECT * FROM processes ORDER BY data_atualizacao DESC");
            }
            
            $processes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($processes);
            
        } elseif (preg_match('/\/api\.php\/processes\/(\d+)/', $path, $matches)) {
            // Get specific process
            $id = $matches[1];
            $stmt = $pdo->prepare("SELECT * FROM processes WHERE id = ?");
            $stmt->execute([$id]);
            $process = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($process) {
                echo json_encode($process);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Process not found']);
            }
        }
        break;
        
    case 'POST':
        if (strpos($path, '/api.php/processes') !== false) {
            // Create new process
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['numero']) || !isset($input['nome'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: numero, nome']);
                break;
            }
            
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO processes (numero, nome, email, telefone, tipo, status, observacoes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $input['numero'],
                    $input['nome'],
                    $input['email'] ?? '',
                    $input['telefone'] ?? '',
                    $input['tipo'] ?? '',
                    $input['status'] ?? 'Em Andamento',
                    $input['observacoes'] ?? ''
                ]);
                
                $id = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'id' => $id]);
                
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(['error' => 'Error creating process: ' . $e->getMessage()]);
            }
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/api\.php\/processes\/(\d+)/', $path, $matches)) {
            // Update process
            $id = $matches[1];
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                break;
            }
            
            // Check if process exists
            $stmt = $pdo->prepare("SELECT id FROM processes WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Process not found']);
                break;
            }
            
            try {
                $stmt = $pdo->prepare("
                    UPDATE processes 
                    SET numero = ?, nome = ?, email = ?, telefone = ?, tipo = ?, status = ?, observacoes = ?, data_atualizacao = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $stmt->execute([
                    $input['numero'] ?? '',
                    $input['nome'] ?? '',
                    $input['email'] ?? '',
                    $input['telefone'] ?? '',
                    $input['tipo'] ?? '',
                    $input['status'] ?? 'Em Andamento',
                    $input['observacoes'] ?? '',
                    $id
                ]);
                
                echo json_encode(['success' => true]);
                
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(['error' => 'Error updating process: ' . $e->getMessage()]);
            }
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/api\.php\/processes\/(\d+)/', $path, $matches)) {
            // Delete process
            $id = $matches[1];
            
            $stmt = $pdo->prepare("DELETE FROM processes WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Process not found']);
            }
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>