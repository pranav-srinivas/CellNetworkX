//------------------------------------------------------------------
// Author: Pranav Srinivas, MVHS,   Date: 5/2/2013
//------------------------------------------------------------------

package signalstorm;

import java.awt.*;
import java.awt.event.*;
import java.io.*;
import javax.swing.*;
import javax.swing.event.*; 
import javax.swing.plaf.metal.*;
import java.util.Random;


//------------------------------------------------------------------
// The top level main game class. Holds CellPanel, ScorePanel,
// menuBar and various push buttons together in a top level Jframe
//------------------------------------------------------------------

public class SignalStorm {
    
    private JFrame     frame;    // Top level frame
    private CellPanel  cell;     // Main Cell Panel where game is played
    private ScorePanel score;    // Score Panel where scores are displayed   
    private JMenuBar   menuBar;  // MenuBar that hold all menus and buttons
    
    private Utilities   utils;   // Utility object to display hep etc.
    
    private JButton    playButton;   // Push button to start the game
    private JButton    pauseButton;  // Push buttton to pause the game
    private JButton    resumeButton; // Push button to resume after pause
    
    
    //--------------------------------------------------------------------
    // Action listener to handle all the menu and button action events
    //--------------------------------------------------------------------
    
    class MenuHandler implements ActionListener { 
        public void actionPerformed(ActionEvent e)
        {
            String command = e.getActionCommand();   // String associated with event source
            AbstractButton aButton = (AbstractButton) e.getSource(); // event source
            
            boolean selected = aButton.getModel().isSelected(); // selected or deselected
         
            // File Menu
            if (command.equals("Open")) { }
            
            if (command.equals("Save")) 
            {
                score.save("StormScore.txt"); // Save all score in StormScore.txt
            }
             
            if (command.equals("Save As")) 
            { 
                // Ask for a file name to save score 
                String fileName = JOptionPane.showInputDialog(null, "File name", 
                                  "Save As", JOptionPane.OK_CANCEL_OPTION);
                
                if (fileName != null)
                    score.save(fileName);
            }
            
            
            if (command.equals("Exit")) 
            {
                System.out.println("\nThanks for Playing SignalStorm. \n" +
                                   "We hope you learned something about Cellular Cancer Signaling.\n" +
                                   "Please send your feedback to prnvsrinivas@gmail.com.\n");
                System.exit(0);
            }
            
            
            //------------------------------------
            // Reset Menu. Ask user confirmation
            //------------------------------------
            if (command.equals("Full"))
            {
                if (resetConfirmed("Full")) 
                {
                    score.resetAllScore();
                    cell.initializeGame();
                }
                
            }      
            if (command.equals("Current"))
            {
                if (resetConfirmed("Current")) 
                {
                    score.resetCurrentScore();
                    cell.initializeGame();
                }
            }

            //---------------------------------------
            // Help Menu. Show game rules
            //---------------------------------------
            if (command.equals("Game Rules"))
                utils.showHelp(0);
                
            if (command.equals("Signaling"))
                utils.showHelp(1);
           
            if (command.equals("Alterations"))
                utils.showHelp(2);    
            
            //------------------------------------------------
            // Signaling Pathways Selection
            //------------------------------------------------
            int pIndex = -1;
            
                 if (command.equals("HedgeHog")) pIndex = 0;
            else if (command.equals("Notch"))    pIndex = 1;
            else if (command.equals("Wnt"))      pIndex = 2;
            else if (command.equals("Jak/STAT")) pIndex = 3;
            else if (command.equals("GPCR"))     pIndex = 4;
            else if (command.equals("Ras"))      pIndex = 5;
            else if (command.equals("PI3K/Akt")) pIndex = 6;
            else if (command.equals("NF-kB"))    pIndex = 7;
            else if (command.equals("TGF-B"))    pIndex = 8;
                 
            if (pIndex >= 0)    
                cell.setPathwaysPreference(pIndex, selected);
   
            //--------------------------------------------------
            // Alterations Selection   
            //--------------------------------------------------
            int aIndex = -1;
            
                 if (command.equals("Mutation"))      aIndex = 0;
            else if (command.equals("Amplification")) aIndex = 1;
            else if (command.equals("Deletion"))      aIndex = 2;
            else if (command.equals("Expression"))    aIndex = 3;
                 
            if (aIndex >= 0)
                cell.setAlterationsPreference(aIndex, selected);
        } 
    } 
   
    
    // Reset confirmation dialog
    public boolean resetConfirmed(String resetString)
    {
        int response = JOptionPane.showConfirmDialog(null,
                        "Are you sure you want to " + resetString + " level reset and start over?\n");    
        boolean answer = false;
        switch(response) {
            case JOptionPane.YES_OPTION: 
                answer = true;
                break;
            case JOptionPane.NO_OPTION:        
            case JOptionPane.CANCEL_OPTION: 
            case JOptionPane.CLOSED_OPTION:
                break;
        }  
        return answer;
    }

    // Create a CheckBoxMenuItem, register listener and add it to menu
    public void addCheckBoxMenuItem(JMenu menu, String command, ActionListener listener) 
    {
      JCheckBoxMenuItem menuItem = new JCheckBoxMenuItem(command);
      menu.add(menuItem);
      menuItem.addActionListener(listener);
      
      if (command.equals("GPCR") || command.equals("Mutation"))
          menuItem.setSelected(true);
    }
    
    // Create a menuItem, register listener and add it to menu
    public void addMenuItem(JMenu menu, String command, ActionListener listener) 
    {
      JMenuItem menuItem = new JMenuItem(command);
      menu.add(menuItem);
      menuItem.addActionListener(listener);
    }
    
    // Create top level Menus
    public void createMenus()
    {   
        menuBar = new JMenuBar();
        
        MenuHandler handler = new MenuHandler();
        
        JMenu fileMenu = new JMenu("File");
        addMenuItem(fileMenu, "Open", handler);
        addMenuItem(fileMenu, "Save", handler);
        addMenuItem(fileMenu, "Save As", handler);
        addMenuItem(fileMenu, "Exit", handler);
        menuBar.add(fileMenu);
        
        JMenu signalingMenu = new JMenu("Signaling");
        addCheckBoxMenuItem(signalingMenu, "HedgeHog", handler);
        addCheckBoxMenuItem(signalingMenu, "Notch", handler);
        addCheckBoxMenuItem(signalingMenu, "Wnt", handler);
        addCheckBoxMenuItem(signalingMenu, "Jak/STAT", handler);
        addCheckBoxMenuItem(signalingMenu, "GPCR", handler);
        addCheckBoxMenuItem(signalingMenu, "Ras", handler);
        addCheckBoxMenuItem(signalingMenu, "PI3K/Akt", handler);
        addCheckBoxMenuItem(signalingMenu, "NF-kB", handler);
        addCheckBoxMenuItem(signalingMenu, "TGF-B", handler);
        menuBar.add(signalingMenu);
        
        JMenu alterationsMenu = new JMenu("Alterations");
        addCheckBoxMenuItem(alterationsMenu, "Mutation", handler);
        addCheckBoxMenuItem(alterationsMenu, "Amplification", handler);
        addCheckBoxMenuItem(alterationsMenu, "Deletion", handler);
        addCheckBoxMenuItem(alterationsMenu, "Expression", handler);
        menuBar.add(alterationsMenu);   
        
        JMenu resetMenu = new JMenu("Reset");
        addMenuItem(resetMenu, "Full", handler);
        addMenuItem(resetMenu, "Current", handler);
        menuBar.add(resetMenu);
        
        JMenu helpMenu = new JMenu("Help");
        addMenuItem(helpMenu, "Game Rules", handler);
        addMenuItem(helpMenu, "Signaling", handler);
        addMenuItem(helpMenu, "Alterations", handler);
        menuBar.add(helpMenu);
        
        playButton = new JButton("Play");
        playButton.addActionListener(cell);
        menuBar.add(playButton);
        
        pauseButton = new JButton("Pause");
        pauseButton.addActionListener(cell);
        menuBar.add(pauseButton);
        
        resumeButton = new JButton("Resume");
        resumeButton.addActionListener(cell);
        menuBar.add(resumeButton);
    }

    public void run()
    {   
        utils = new Utilities();
        
        score = new ScorePanel();
        cell  = new CellPanel(score);
        
        //-----------------------------------------------------------------
        // Play, Pause and Resume buttons use 'cell' as the action-listener
        // so it must be created after cell panel is created
        //------------------------------------------------------------------
        createMenus();
        
        frame = new JFrame("SignalStorm");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);  
        
        frame.setLayout(null);
        score.setBounds(1005, 0, 180, 690);
        cell.setBounds(0, 0, 1000, 700);
       
        frame.getContentPane().add(cell); 
        frame.getContentPane().add(score);
        
        // Add menu bar
        frame.setJMenuBar(menuBar);
        
        // set frame size in pixels
        frame.setLocation(50, 10);
        frame.setSize(1200, 720); 
        
        // Make frame visible
        frame.setVisible(true);  
        
        // Make frame not resizable
        frame.setResizable(false);
    }

    public static void main(String[] args) {
        SignalStorm storm = new SignalStorm();
        storm.run();
    }
}
