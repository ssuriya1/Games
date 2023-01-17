import javax.swing.ButtonGroup;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JRadioButton;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/**
 * @author Surya Sundarrajan n505794 on 13/04/2022
 */
final class OnlineTest extends JFrame implements ActionListener {
    int count, current, x = 1, now;
    int[] m = new int[10];

    JLabel label;
    JRadioButton[] radioButtons = new JRadioButton[5];
    JButton button1, button2;
    ButtonGroup buttonGroup;

    OnlineTest(String s) {
        super(s);
        label = new JLabel();
        add(label);

        buttonGroup = new ButtonGroup();
        for (int i = 0; i < 5; i++) {
            radioButtons[i] = new JRadioButton();
            add(radioButtons[i]);
            buttonGroup.add(radioButtons[i]);
        }

        button1 = new JButton("Next");
        button1.addActionListener(this);
        add(button1);

        button2 = new JButton("Skip");
        button2.addActionListener(this);
        add(button2);
        set();

        label.setBounds(30, 40, 450, 20);

        radioButtons[0].setBounds(50, 80, 100, 20);
        radioButtons[1].setBounds(50, 110, 100, 20);
        radioButtons[2].setBounds(50, 140, 100, 20);
        radioButtons[3].setBounds(50, 170, 100, 20);

        button1.setBounds(100, 240, 100, 30);
        button2.setBounds(270, 240, 100, 30);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(null);
        setLocation(250, 100);
        setVisible(true);
        setSize(600, 350);
    }

    public static void main(String[] s) {
        new OnlineTest("Online Test Of Java");
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == button1) {
            if (check()) {
                count = count + 1;
            }
            current++;
            set();
            if (current == 9) {
                button1.setEnabled(false);
                button2.setText("Result");
            }
        }

        if ("Skip".equals(e.getActionCommand())) {
            current++;
            set();
            if (current == 9) {
                button2.setText("Result");
            }
            setVisible(false);
            setVisible(true);
        }

        for (int i = 0, y = 1; i < x; i++, y++) {
            if (e.getActionCommand().equals("Skip" + y)) {
                if (check()) {
                    count = count + 1;
                }
                now = current;
                current = m[y];
                set();
                ((JButton) e.getSource()).setEnabled(false);
                current = now;
            }
        }

        if ("Result".equals(e.getActionCommand())) {
            if (check()) {
                count = count + 1;
            }
            current++;

            String[] answerList = {"1.Float", "2.Object", "3.Lang", "4.Lang", "5.SSS IT", "6.Get", "7.Actionperformed",
                    "8.getDocumentBase", "9.Main", "10.JButtonGroup"};
            JOptionPane.showMessageDialog(this, "correct ans=" + count, "Correct Answers", JOptionPane.INFORMATION_MESSAGE);
            JOptionPane.showMessageDialog(this, answerList, "Answers", JOptionPane.PLAIN_MESSAGE);

            int choice = JOptionPane.showConfirmDialog(this, "Do you want to play again ?", "Select your choice", JOptionPane.YES_NO_OPTION);
            if (choice == 0) {
                new OnlineTest("Online Test Of Java");
            } else {
                System.exit(0);
            }
        }
    }

    void set() {
        radioButtons[4].setSelected(true);

        if (current == 0) {
            label.setText("Que1: Which one among these is not a primitive datatype?");
            radioButtons[0].setText("int");
            radioButtons[1].setText("Float");
            radioButtons[2].setText("boolean");
            radioButtons[3].setText("char");
        }
        if (current == 1) {
            label.setText("Que2: Which class is available to all the class automatically?");
            radioButtons[0].setText("Swing");
            radioButtons[1].setText("Applet");
            radioButtons[2].setText("Object");
            radioButtons[3].setText("ActionEvent");
        }
        if (current == 2) {
            label.setText("Que3: Which package is directly available to our class without importing it?");
            radioButtons[0].setText("swing");
            radioButtons[1].setText("applet");
            radioButtons[2].setText("net");
            radioButtons[3].setText("lang");
        }
        if (current == 3) {
            label.setText("Que4: String class is defined in which package?");
            radioButtons[0].setText("lang");
            radioButtons[1].setText("Swing");
            radioButtons[2].setText("Applet");
            radioButtons[3].setText("awt");
        }
        if (current == 4) {
            label.setText("Que5: Which institute is best for java coaching?");
            radioButtons[0].setText("Utek");
            radioButtons[1].setText("Aptech");
            radioButtons[2].setText("SSS IT");
            radioButtons[3].setText("jtek");
        }
        if (current == 5) {
            label.setText("Que6: Which one among these is not a keyword?");
            radioButtons[0].setText("class");
            radioButtons[1].setText("int");
            radioButtons[2].setText("get");
            radioButtons[3].setText("if");
        }
        if (current == 6) {
            label.setText("Que7: Which one among these is not a class? ");
            radioButtons[0].setText("Swing");
            radioButtons[1].setText("Actionperformed");
            radioButtons[2].setText("ActionEvent");
            radioButtons[3].setText("Button");
        }
        if (current == 7) {
            label.setText("Que8: which one among these is not a function of Object class?");
            radioButtons[0].setText("toString");
            radioButtons[1].setText("finalize");
            radioButtons[2].setText("equals");
            radioButtons[3].setText("getDocumentBase");
        }
        if (current == 8) {
            label.setText("Que9: which function is not present in Applet class?");
            radioButtons[0].setText("init");
            radioButtons[1].setText("main");
            radioButtons[2].setText("start");
            radioButtons[3].setText("destroy");
        }
        if (current == 9) {
            label.setText("Que10: Which one among these is not a valid component?");
            radioButtons[0].setText("JButton");
            radioButtons[1].setText("JList");
            radioButtons[2].setText("JButtonGroup");
            radioButtons[3].setText("JTextArea");
        }

        label.setBounds(30, 40, 450, 20);
        for (int i = 0, j = 0; i <= 90; i += 30, j++) {
            radioButtons[j].setBounds(50, 80 + i, 200, 20);
        }
    }

    boolean check() {
        if (current == 0) {
            return radioButtons[1].isSelected();
        }
        if (current == 1) {
            return radioButtons[2].isSelected();
        }
        if (current == 2) {
            return radioButtons[3].isSelected();
        }
        if (current == 3) {
            return radioButtons[0].isSelected();
        }
        if (current == 4) {
            return radioButtons[2].isSelected();
        }
        if (current == 5) {
            return radioButtons[2].isSelected();
        }
        if (current == 6) {
            return radioButtons[1].isSelected();
        }
        if (current == 7) {
            return radioButtons[3].isSelected();
        }
        if (current == 8) {
            return radioButtons[1].isSelected();
        }
        if (current == 9) {
            return radioButtons[2].isSelected();
        }
        return false;
    }
}
