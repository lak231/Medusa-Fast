/* *****************************************
 * CSCI205 - Software Engineering and Design
 * Spring 2016
 *
 * Name: Tom Ficcadenti
 * Date: Feb 3, 2016
 * Time: 10:28:13 AM
 *
 * Project: csci205
 * Package: Lab05
 * File: Hello
 * Description:
 *
 * ****************************************
 */
package lab05;

import java.util.Arrays;
import java.util.Random;
import java.util.Scanner;

/**
 * A simple program to aid in understanding NetBeans
 *
 * @author tjf010
 * @version 0.1
 */
public class Hello {

    private static final int NUM_INTS = 10;

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        greatUser();

        int[] x = ArrayOfRandomNums();
        System.out.println(Arrays.toString(x));
    }

    /**
     * A method that creates an array of 10 numbers
     *
     */
    private static int[] ArrayOfRandomNums() {
        Random rand = new Random();
        int[] x = new int[NUM_INTS];
        for (int i = 0; i < NUM_INTS; i++) {
            x[i] = rand.nextInt(100);
        }
        return x;
    }

    /**
     * A method that prints a friendly message
     *
     */
    private static void greatUser() {
        Scanner in = new Scanner(System.in);
        System.out.print("Hello. What is your name? ");
        String name = in.next();

        System.out.println(name + ", becoming a good programmer takes practice.");
    }
}
