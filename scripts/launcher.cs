using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

namespace SewStudioLauncher
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "SewStudio - Sistema de Costura y Patronaje";
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine(@"
  ==============================================================
    SEWSTUDIO - PLATAFORMA DE COSTURA Y PATRONAJE
  ==============================================================
            ");
            Console.ResetColor();

            string projectDir = @"C:\Users\jazmin\OneDrive\Documentos\proyecto jaz\ProyectoJazmin-main\ProyectoJazmin-main";
            if (!Directory.Exists(projectDir))
            {
                projectDir = AppDomain.CurrentDomain.BaseDirectory;
            }

            Console.WriteLine("[1/4] Verificando Docker Desktop...");
            EnsureDockerRunning();

            Console.WriteLine("\n[2/4] Iniciando contenedores de SewStudio (Docker Compose)...");
            StartDockerCompose(projectDir);

            Console.WriteLine("\n[3/4] Esperando que la aplicacion este lista en http://localhost:3000...");
            WaitForAppReady("http://localhost:3000", 120);

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n[4/4] ¡SewStudio esta listo! Abriendo navegador...");
            Console.ResetColor();

            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3000",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Abre manualmente tu navegador en: http://localhost:3000 (" + ex.Message + ")");
            }

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine(@"
  ==============================================================
    SewStudio esta en ejecucion en: http://localhost:3000
    Todos tus proyectos, moldes y medidas se guardan en Docker
  ==============================================================
    [S] Abrir de nuevo en el navegador
    [D] Detener SewStudio
    [Q] Salir de esta ventana (SewStudio seguira en segundo plano)
  ==============================================================
            ");
            Console.ResetColor();

            while (true)
            {
                Console.Write("Selecciona una opcion (S / D / Q): ");
                ConsoleKeyInfo key = Console.ReadKey(true);
                Console.WriteLine(key.KeyChar);

                if (key.Key == ConsoleKey.S)
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "http://localhost:3000",
                        UseShellExecute = true
                    });
                }
                else if (key.Key == ConsoleKey.D)
                {
                    Console.WriteLine("\nDeteniendo contenedores de SewStudio...");
                    StopDockerCompose(projectDir);
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("SewStudio se ha detenido correctamente. Tus datos siguen guardados.");
                    Console.ResetColor();
                    Thread.Sleep(2500);
                    break;
                }
                else if (key.Key == ConsoleKey.Q)
                {
                    Console.WriteLine("\nSaliendo del lanzador. SewStudio continuara ejecutandose en segundo plano.");
                    Thread.Sleep(1500);
                    break;
                }
            }
        }

        static void EnsureDockerRunning()
        {
            if (IsDockerResponsive())
            {
                Console.WriteLine("  -> Docker Desktop ya esta activo.");
                return;
            }

            Console.WriteLine("  -> Iniciando Docker Desktop en segundo plano...");
            string dockerPath = @"C:\Users\jazmin\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe";
            if (!File.Exists(dockerPath))
            {
                dockerPath = @"C:\Program Files\Docker\Docker\Docker Desktop.exe";
            }

            if (File.Exists(dockerPath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = dockerPath,
                    UseShellExecute = true
                });
            }

            for (int i = 0; i < 60; i++)
            {
                if (IsDockerResponsive())
                {
                    Console.WriteLine("\n  -> Docker Desktop iniciado y listo.");
                    return;
                }
                Thread.Sleep(2000);
                Console.Write(".");
            }
            Console.WriteLine();
        }

        static bool IsDockerResponsive()
        {
            try
            {
                Process p = new Process();
                p.StartInfo.FileName = "docker";
                p.StartInfo.Arguments = "info";
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.RedirectStandardOutput = true;
                p.StartInfo.RedirectStandardError = true;
                p.StartInfo.CreateNoWindow = true;
                p.Start();
                p.WaitForExit(3000);
                return p.ExitCode == 0;
            }
            catch
            {
                return false;
            }
        }

        static void StartDockerCompose(string workingDir)
        {
            Process p = new Process();
            p.StartInfo.FileName = "docker";
            p.StartInfo.Arguments = "compose up -d --build";
            p.StartInfo.WorkingDirectory = workingDir;
            p.StartInfo.UseShellExecute = false;
            p.Start();
            p.WaitForExit();
        }

        static void StopDockerCompose(string workingDir)
        {
            Process p = new Process();
            p.StartInfo.FileName = "docker";
            p.StartInfo.Arguments = "compose stop";
            p.StartInfo.WorkingDirectory = workingDir;
            p.StartInfo.UseShellExecute = false;
            p.Start();
            p.WaitForExit();
        }

        static void WaitForAppReady(string url, int maxSeconds)
        {
            int elapsed = 0;
            while (elapsed < maxSeconds)
            {
                try
                {
                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                    request.Timeout = 2000;
                    request.Method = "GET";
                    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                    {
                        if (response.StatusCode == HttpStatusCode.OK ||
                            ((int)response.StatusCode >= 200 && (int)response.StatusCode < 400))
                        {
                            return;
                        }
                    }
                }
                catch
                {
                    // Servidor en proceso de inicio
                }
                Thread.Sleep(2000);
                elapsed += 2;
                Console.Write(".");
            }
            Console.WriteLine();
        }
    }
}
